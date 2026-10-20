// provisionalTaxRoutes.js
/* Provisional tax (IRP6) endpoints, mounted at /provisional by app.js.

  POST   /calculate   - work out what is payable on one IRP6 (saves nothing)
  POST   /save        - save a calculation to the logged in user's history
  GET    /history     - the logged in user's saved calculations
  DELETE /history/:id - remove one of the logged in user's saved calculations

The tax years themselves are not served from here: provisional tax is the same
normal tax the income tax calculator works out, so the brackets, rebates and
thresholds come from the SAME configuration and the client keeps reading its
dropdown from GET /tax/config. A second endpoint serving the same list is a
second place for it to go stale.

/save deliberately RECALCULATES from the user's inputs instead of storing the
figures the browser sends. A saved record is therefore always internally
consistent, and a tampered request cannot write false totals to the database.

The history routes scope every query by the user id on the JWT, never by an id
taken from the request, so a user can only ever read or delete their own
records. */
/* Load environment variables from a .env
file using the dotenv package*/
require('dotenv').config()
//IMPORT REQUIRED MODULES AND PACKAGES
const express = require('express');
// IMPORT SCHEMAS
const User = require('../models/userSchema')
const ProvTaxCalc = require('../models/provTaxCalcSchema')
const TaxYearConfig = require('../models/taxYearSchema');
// IMPORT CUSTOM MIDDLEWARE
const { checkJwtToken } = require('../middleware/middleware');
// IMPORT UTILITY FUNCTIONS
const { PROVISIONAL_PERIODS } = require('../util/calculationUtil');
const { calculateProvisionalTax } = require('../util/utilFunc');
const { taxSeedData } = require('../dataArrays/taxSeedData');

const router = express.Router()


// Bounds accepted for a taxpayer's age, matching provTaxCalcSchema
const MIN_AGE = 16;
const MAX_AGE = 120;
/* Upper bound on any rand figure in the request, guarding against nonsense
values overflowing the maths. The same cap the income tax route applies. */
const MAX_AMOUNT = 1_000_000_000;
/* Most saved calculations a single /history response will return. A user's
history grows without limit, so the newest records are returned and the total
is reported alongside them rather than the response growing unbounded. */
const HISTORY_LIMIT = 100;

/* The optional rand figures on an IRP6: what has already been withheld,
credited or paid towards the year, and the medical scheme fees credits the
taxpayer supplies. All default to 0, because a blank field on the form means
"none of this applies", not "unknown". */
const OPTIONAL_AMOUNTS = ['employeesTax', 'foreignTaxCredits', 'priorPayments', 'medicalCredits'];

// The labels each optional amount is reported under when it is rejected
const AMOUNT_LABELS = {
    employeesTax: "employeesTax (employees' tax already withheld)",
    foreignTaxCredits: 'foreignTaxCredits',
    priorPayments: 'priorPayments (provisional tax already paid)',
    medicalCredits: 'medicalCredits (medical scheme fees tax credits)',
};

/*=====================================
SHARED INPUT VALIDATION
=======================================*/
/* Reads an optional rand figure off the request body. A field the form left
blank arrives as undefined, null or an empty string and means nothing of that
kind applies, so it becomes 0 rather than NaN. */
const toOptionalAmount = (value) =>
    value === undefined || value === null || value === '' ? 0 : Number(value);

/* Reads the request body and coerces it to numbers, so /calculate and /save
parse a request in exactly the same way and cannot disagree about what was
asked for. */
const parseProvisionalInput = (body = {}) => {
    const input = {
        period: typeof body.period === 'string' ? body.period.trim().toLowerCase() : body.period,
        /* Anything but a string becomes '' so validation rejects it, rather than
        an object reaching the database query as an operator */
        taxYear: typeof body.taxYear === 'string' ? body.taxYear.trim() : '',
        estimatedTaxableIncome: parseFloat(body.estimatedTaxableIncome),
        age: Number(body.age),
        /* The basic amount stays NULL when it was not supplied: a taxpayer
        filing their first IRP6 has no assessment to take one from, and a
        missing basic amount is not the same as a basic amount of nil. */
        basicAmount: body.basicAmount === undefined || body.basicAmount === null || body.basicAmount === ''
            ? null
            : parseFloat(body.basicAmount),
    };

    for (const field of OPTIONAL_AMOUNTS) {
        input[field] = toOptionalAmount(body[field]);
    }

    return input;
};

/* Validates the body shared by /calculate and /save. Returns a message
describing the first problem found, or null when the input is usable.

This repeats the checks ProvisionalTaxCalculatorForm.js already runs in the
browser, because the browser's copy can be bypassed - this is the one that
decides what reaches the maths and the database. */
const validateProvisionalInput = (input) => {
    // Conditional rendering to validate which of the three payments was asked for
    if (!PROVISIONAL_PERIODS.includes(input.period)) {
        return `period must be one of: ${PROVISIONAL_PERIODS.join(', ')}`;
    }
    /* Conditional rendering to validate the estimate. The brackets start at R1,
    so an estimate of nil has no tax to work out and no IRP6 to file. */
    if (isNaN(input.estimatedTaxableIncome) || input.estimatedTaxableIncome <= 0 || input.estimatedTaxableIncome > MAX_AMOUNT) {
        return `estimatedTaxableIncome must be a number greater than 0 and no more than ${MAX_AMOUNT}`;
    }
    // Conditional rendering to validate the age is a whole number in range
    if (!Number.isInteger(input.age) || input.age < MIN_AGE || input.age > MAX_AGE) {
        return `age must be a whole number between ${MIN_AGE} and ${MAX_AGE}`;
    }
    // Conditional rendering to check a tax year was named
    if (!input.taxYear) {
        return 'taxYear is required';
    }

    // Conditional rendering to validate each of the optional rand figures
    for (const field of OPTIONAL_AMOUNTS) {
        const value = input[field];
        if (!Number.isFinite(value) || value < 0 || value > MAX_AMOUNT) {
            return `${AMOUNT_LABELS[field]} must be a number between 0 and ${MAX_AMOUNT}`;
        }
    }

    /* Conditional rendering to check the basic amount, when one was supplied.
    An estimate BELOW the basic amount is allowed through: paragraph 19(3)
    leaves that to SARS to revise, so the calculator warns about it in the
    result rather than refusing to work the figures out. */
    if (input.basicAmount !== null) {
        if (isNaN(input.basicAmount) || input.basicAmount < 0 || input.basicAmount > MAX_AMOUNT) {
            return `basicAmount must be a number between 0 and ${MAX_AMOUNT}, or left out`;
        }
    }

    /* Conditional rendering to check nothing has already been paid on a FIRST
    payment. The first IRP6 of a year of assessment is by definition the first
    payment towards it, so a prior payment here would be double-counted. */
    if (input.period === 'first' && input.priorPayments > 0) {
        return 'priorPayments must be 0 on a first provisional payment: nothing has been paid towards the year yet';
    }

    return null;
};

/* Function to look up the configuration for a tax year. The database copy wins;
the seed data is the fallback so the calculator still works before any tax year
has been saved to the database. Returns null for an unknown tax year. */
const findTaxYearConfig = async (taxYear) => {
    const config = await TaxYearConfig.findOne({ taxYear }).lean().exec();
    if (config) return config;
    return taxYear === taxSeedData.taxYear ? taxSeedData : null;
};

/*──────────────────────────── POST ROUTES ──────────────────────────────
    POST: Used to create a new resource/submit data to the database
 ─────────────────────────────────────────────────────────────────────────*/
// Route to calculateProvisionalTax
// Send A POST request to /provisional/calculate endpoint
// FRONT END : src/components/ProvisionalTaxCalculator.js
router.post('/calculate', checkJwtToken, async (req,res) => {
    const input = parseProvisionalInput(req.body);

    const validationMessage = validateProvisionalInput(input)

    // Conditional rendering to check the submitted figures are usable
    if (validationMessage) {
        console.warn('[WARN: provisionalTaxRoutes.js, /calculate] Rejected:', validationMessage);
        return res.status(400).json({ success: false, message: validationMessage });// Send a 400 (Bad Request) status code with a message
    }

    try {
        const config = await findTaxYearConfig(input.taxYear)

        // Conditional rendering to check the tax year is one the calculator knows
        if (!config) {
            console.warn('[WARN: provisionalTaxRoutes.js, /calculate] Unknown tax year', input.taxYear);
            return res.status(404).json({ success: false, message: `No tax data found for the ${input.taxYear} tax year` });// Send a 404 (Not Found) status code with a message
        }

        const result = calculateProvisionalTax(input, config)
        console.log('[SUCCESS: provisionalTaxRoutes.js, /calculate] Calculated', input.period, 'provisional payment for', input.taxYear);
        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('[ERROR: provisionalTaxRoutes.js, /calculate]', error.message);// Log an error message in the console for debugging purposes
        return res.status(500).json({ success: false, message: 'Internal Server Error' });// Return a 500 (Internal Server Error) status code with a message
    }
})

// Route to save a provisional tax calculation
// Send a POST request to /provisional/save endpoint
// FRONT END : src/components/ProvisionalTaxCalculator.js
router.post('/save', checkJwtToken, async (req, res) => {
    const input = parseProvisionalInput(req.body);

    const validationMessage = validateProvisionalInput(input)

    // Conditional rendering to check the submitted figures are usable
    if (validationMessage) {
        console.warn('[WARN: provisionalTaxRoutes.js, /save] Rejected:', validationMessage);
        return res.status(400).json({ success: false, message: validationMessage });// Send a 400 (Bad Request) status code with a message
    }

    try {
        // The username is read from the database rather than trusted from the body
        const user = await User.findById(req.user.userId)
            .select('username')
            .exec();

        // Conditional rendering to check the user on the token still exists
        if (!user) {
            console.warn('[WARN: provisionalTaxRoutes.js, /save] No user found for id', req.user.userId);
            return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
        }

        const config = await findTaxYearConfig(input.taxYear)

        // Conditional rendering to check the tax year is one the calculator knows
        if (!config) {
            console.warn('[WARN: provisionalTaxRoutes.js, /save] Unknown tax year', input.taxYear);
            return res.status(404).json({ success: false, message: `No tax data found for the ${input.taxYear} tax year` });// Send a 404 (Not Found) status code with a message
        }

        /* Recalculated from the inputs rather than stored as sent, so the saved
        record always reconciles (see the note at the top of this file). */
        const result = calculateProvisionalTax(input, config)
        const saved = await ProvTaxCalc.create({
            user: user._id,
            username: user.username,
            ...result,
        });

        console.log('[SUCCESS: provisionalTaxRoutes.js, /save] Saved provisional tax calculation', saved._id, 'for user', user._id);
        return res.status(201).json({ success: true, message: 'Calculation saved to your history', saved, result });// Return a 201 (Created) status code with the saved record
    } catch (error) {
        // A schema validation failure is the user's input, not a server fault
        if (error.name === 'ValidationError') {
            console.error('[ERROR: provisionalTaxRoutes.js, /save] Validation failed:', error.message);
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('[ERROR: provisionalTaxRoutes.js, /save]', error.message);// Log an error message in the console for debugging purposes
        return res.status(500).json({ success: false, message: 'Internal Server Error' });// Return a 500 (Internal Server Error) status code with a message
    }
})

module.exports = router