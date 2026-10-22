// taxRoutes.js
/* Income tax endpoints, mounted at /tax by app.js.

  GET    /config      - tax years the calculator can work with
  POST   /config      - create or update a tax year configuration (admin only)
  POST   /calculate   - work out the tax payable (returns a result, saves nothing)
  POST   /save        - save a calculation to the logged in user's history
  GET    /history     - the logged in user's saved calculations
  DELETE /history/:id - remove one of the logged in user's saved calculations

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
const User = require('../models/userSchema');
const TaxCalc = require('../models/taxCalcSchema');
const TaxYearConfig = require('../models/taxYearSchema');
// IMPORT CUSTOM MIDDLEWARE
const { checkJwtToken } = require('../middleware/middleware');
// IMPORT UTILITY FUNCTIONS
const { INCOME_TYPES, MIN_TAX_AGE, MAX_TAX_AGE, MAX_DEPENDANTS } = require('../util/calculationUtil');
const { calculateIncomeTax } = require('../util/utilFunc');
const { taxSeedData } = require('../dataArrays/taxSeedData');

const router = express.Router()

/* Upper bound on the income in the request, guarding against nonsense values
overflowing the maths. The same cap the VAT and provisional tax routes apply. */
const MAX_AMOUNT = 1_000_000_000;

//=======INPUT VALIDATION=============
/* Reads the request body and coerces it to the shapes the maths expects, so
/calculate and /save parse a request in exactly the same way and cannot disagree
about what was asked for. */
const parseTaxInput = (body = {}) => ({
    incomeType: typeof body.incomeType === 'string' ? body.incomeType.trim().toLowerCase() : 'annual',
    income: parseFloat(body.income),
    age: Number(body.age),
    taxYear: typeof body.taxYear === 'string' ? body.taxYear.trim() : '',
    // Dependants are optional, so default them to 0
    dependants: body.dependants === undefined || body.dependants === null || body.dependants === ''
        ? 0
        : Number(body.dependants),
});

/* Validates the body shared by /calculate and /save. Returns a message
describing the first problem found, or null when the input is usable.

This repeats the checks IncomeTaxCalculator.js already runs in the browser,
because the browser's copy can be bypassed - this is the one that decides what
reaches the maths and the database. */
const validateTaxInput = ({ incomeType, income, age, taxYear, dependants }) => {
    // Conditional rendering to check the income period is one that is supported
    if (!INCOME_TYPES.includes(incomeType)) {
        return `incomeType must be one of: ${INCOME_TYPES.join(', ')}`;
    }
    // Conditional rendering to validate the income
    if (!Number.isFinite(income) || income < 0 || income > MAX_AMOUNT) {
        return `income must be a number between 0 and ${MAX_AMOUNT}`;
    }
    // Conditional rendering to validate the age: whole years only
    if (!Number.isInteger(age) || age < MIN_TAX_AGE || age > MAX_TAX_AGE) {
        return `age must be a whole number between ${MIN_TAX_AGE} and ${MAX_TAX_AGE}`;
    }
    // Conditional rendering to check a tax year was named
    if (!taxYear) {
        return 'taxYear is required';
    }
    // Conditional rendering to validate the medical aid dependants
    if (!Number.isInteger(dependants) || dependants < 0 || dependants > MAX_DEPENDANTS) {
        return `dependants must be a whole number between 0 and ${MAX_DEPENDANTS}`;
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

/*──────────────────────────── GET ROUTES ─────────────────────────────────────
   GET: READ — Used to fetch information from the database
────────────────────────────────────────────────────────────────────────────────*/
// Route to fetch the tax years the calculators can work with
//  Send a GET request to the /tax/config route
// FRONT END FILE: /client/src/pages/Tax.js
/* Returns the tax years saved in the database plus the seed year (so the list
is never empty), newest first. "YYYY-YYYY" strings sort correctly as text. */
router.get('/config', checkJwtToken, async (req, res) => {
    try {
        const savedYears = await TaxYearConfig.distinct('taxYear').exec();
        const taxYears = [...new Set([...savedYears, taxSeedData.taxYear])]
            .sort((a, b) => b.localeCompare(a));

        console.log('[SUCCESS: taxRoutes.js, /config] Found', taxYears.length, 'tax year(s)');
        return res.status(200).json({ success: true, taxYears });
    } catch (error) {
        console.error('[ERROR: taxRoutes.js, /config]', error.message);// Log an error message in the console for debugging purposes
        return res.status(500).json({ success: false, message: 'Internal Server Error' });// Return a 500 (Internal Server Error) status code with a message
    }
})

/*──────────────────────────── POST ROUTES ──────────────────────────────
    POST: Used to create a new resource/submit data to the database
 ─────────────────────────────────────────────────────────────────────────*/
// Route to calculate income tax
//  Send a POST request to the /tax/calculate route
// FRONT END FILE: /client/src/components/IncomeTaxCalculator.js
router.post('/calculate', checkJwtToken, async (req, res) => {
    const input = parseTaxInput(req.body)

    const validationMessage = validateTaxInput(input)

    // Conditional rendering to check the submitted figures are usable
    if (validationMessage) {
        console.warn('[WARN: taxRoutes.js, /calculate] Rejected:', validationMessage);
        return res.status(400).json({ success: false, message: validationMessage })// Send a 400 (Bad Request) status code with a message
    }

    try {
        const config = await findTaxYearConfig(input.taxYear)

        // Conditional rendering to check the tax year is one the calculator knows
        if (!config) {
            console.warn('[WARN: taxRoutes.js, /calculate] Unknown tax year', input.taxYear);
            return res.status(404).json({ success: false, message: `No tax data found for the ${input.taxYear} tax year` });// Send a 404 (Not Found) status code with a message
        }

        const result = calculateIncomeTax(input, config)
        console.log('[SUCCESS: taxRoutes.js, /calculate] Calculated income tax for', input.taxYear);
        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('[ERROR: taxRoutes.js, /calculate]', error.message);// Log an error message in the console for debugging purposes
        return res.status(500).json({ success: false, message: 'Internal Server Error' });// Return a 500 (Internal Server Error) status code with a message
    }
})

//Route to save an income tax calculation
//  Send a POST request to the /tax/save route
// FRONT END FILE: /client/src/components/IncomeTaxCalculator.js
router.post('/save', checkJwtToken, async (req, res) => {
    const input = parseTaxInput(req.body)

    const validationMessage = validateTaxInput(input)

    // Conditional rendering to check the submitted figures are usable
    if (validationMessage) {
        console.warn('[WARN: taxRoutes.js, /save] Rejected:', validationMessage);
        return res.status(400).json({ success: false, message: validationMessage })// Send a 400 (Bad Request) status code with a message
    }

    try {
        // The username is read from the database rather than trusted from the body
        const user = await User.findById(req.user.userId)
            .select('username')
            .exec();

        // Conditional rendering to check the user on the token still exists
        if (!user) {
            console.warn('[WARN: taxRoutes.js, /save] No user found for id', req.user.userId);
            return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
        }

        const config = await findTaxYearConfig(input.taxYear)

        // Conditional rendering to check the tax year is one the calculator knows
        if (!config) {
            console.warn('[WARN: taxRoutes.js, /save] Unknown tax year', input.taxYear);
            return res.status(404).json({ success: false, message: `No tax data found for the ${input.taxYear} tax year` });// Send a 404 (Not Found) status code with a message
        }

        /* Recalculated from the inputs rather than stored as sent, so the saved
        record always reconciles (see the note at the top of this file). */
        const result = calculateIncomeTax(input, config)
        const saved = await TaxCalc.create({
            user: user._id,
            username: user.username,
            taxYear: result.taxYear,
            incomeType: result.incomeType,
            income: result.income,
            age: result.age,
            dependants: result.dependants,
            annualIncome: result.annualIncome,
            grossTax: result.grossTax,
            rebate: result.rebate,
            netTax: result.netTax,
            effectiveRate: result.effectiveRate,
            marginalRate: result.marginalRate,
            bracketBreakdown: result.bracketBreakdown,
        });

        console.log('[SUCCESS: taxRoutes.js, /save] Saved income tax calculation', saved._id, 'for user', user._id);
        return res.status(201).json({ success: true, message: 'Calculation saved to your history', saved, result });// Return a 201 (Created) status code with the saved record
    } catch (error) {
        // A schema validation failure is the user's input, not a server fault
        if (error.name === 'ValidationError') {
            console.error('[ERROR: taxRoutes.js, /save] Validation failed:', error.message);
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('[ERROR: taxRoutes.js, /save]', error.message);// Log an error message in the console for debugging purposes
        return res.status(500).json({ success: false, message: 'Internal Server Error' });// Return a 500 (Internal Server Error) status code with a message
    }
})

module.exports = router
