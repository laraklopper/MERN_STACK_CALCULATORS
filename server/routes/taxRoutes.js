// taxRoutes.js
/* Income tax endpoints, mounted at /tax by app.js.

  GET    /config      - tax years the calculator can work with
  POST   /config      - add a new tax year configuration (admin only)
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
const { checkJwtToken, checkAdmin } = require('../middleware/middleware');
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

//=======TAX YEAR CONFIG VALIDATION=============
// Most brackets a tax year can have (SARS currently uses 7)
const MAX_BRACKETS = 20;

// Checks a value is a finite number between 0 and MAX_AMOUNT
const isAmount = (value) => Number.isFinite(value) && value >= 0 && value <= MAX_AMOUNT;

/* Reads the body sent by TaxYearForm.js and coerces it to the shape of a
TaxYearConfig document. The start and end dates are worked out from the tax
year (1 March to the last day of February) rather than taken from the request,
so they always match the year's name. */
const parseTaxYearConfig = (body = {}) => {
    const taxYear = typeof body.taxYear === 'string' ? body.taxYear.trim() : '';
    const startYear = Number(taxYear.slice(0, 4));
    const toNumber = (value) => (value === null || value === undefined || value === '' ? NaN : Number(value));

    return {
        taxYear,
        startDate: new Date(Date.UTC(startYear, 2, 1)),// 1 March
        endDate: new Date(Date.UTC(startYear + 1, 2, 0)),// Day 0 of March = last day of February
        brackets: Array.isArray(body.brackets)
            ? body.brackets.map((b = {}) => ({
                min: toNumber(b.min),
                // A blank max means the bracket has no ceiling
                max: b.max === null || b.max === undefined || b.max === '' ? null : Number(b.max),
                baseAmount: toNumber(b.baseAmount),
                rate: toNumber(b.rate),
            }))
            : [],
        rebates: {
            primary: toNumber(body.rebates?.primary),
            secondary: toNumber(body.rebates?.secondary),
            tertiary: toNumber(body.rebates?.tertiary),
        },
        thresholds: {
            under65: toNumber(body.thresholds?.under65),
            age65to74: toNumber(body.thresholds?.age65to74),
            age75plus: toNumber(body.thresholds?.age75plus),
        },
        isActive: true,
    };
};

/* Validates a tax year configuration. Returns a message describing the first
problem found, or null when the configuration is usable.

The schema only checks the fields exist, so this is what stops a badly formed
tax year (brackets out of order, a rate of 18 instead of 0.18) from reaching the
database and breaking every calculation made for that year. */
const validateTaxYearConfig = ({ taxYear, brackets, rebates, thresholds }) => {
    // Conditional rendering to check the tax year is two consecutive years, e.g. 2026-2027
    const match = /^(\d{4})-(\d{4})$/.exec(taxYear);
    if (!match || Number(match[2]) !== Number(match[1]) + 1) {
        return 'taxYear must be two consecutive years in the format YYYY-YYYY, e.g. 2026-2027';
    }
    // Conditional rendering to check the number of brackets
    if (brackets.length === 0 || brackets.length > MAX_BRACKETS) {
        return `A tax year must have between 1 and ${MAX_BRACKETS} brackets`;
    }
    for (let i = 0; i < brackets.length; i++) {
        const { min, max, baseAmount, rate } = brackets[i];
        const row = `Bracket ${i + 1}`;
        const isLast = i === brackets.length - 1;

        if (!isAmount(min) || !isAmount(baseAmount)) {
            return `${row}: min and base amount must be numbers between 0 and ${MAX_AMOUNT}`;
        }
        // Rates are decimals, so 18% is 0.18
        if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
            return `${row}: rate must be a decimal between 0 and 1, e.g. 0.18 for 18%`;
        }
        // Only the last bracket is open-ended
        if (isLast ? max !== null : !isAmount(max)) {
            return isLast
                ? `${row}: the last bracket must have no maximum`
                : `${row}: max is required for every bracket except the last`;
        }
        if (max !== null && max < min) {
            return `${row}: max cannot be less than min`;
        }
        // Each bracket must start at R1 above the previous one's maximum
        if (i > 0 && min !== brackets[i - 1].max + 1) {
            return `${row}: min must be R1 more than the max of bracket ${i}`;
        }
    }
    if (!Object.values(rebates).every(isAmount)) {
        return 'Rebates must be numbers between 0 and ' + MAX_AMOUNT;
    }
    if (!Object.values(thresholds).every(isAmount)) {
        return 'Thresholds must be numbers between 0 and ' + MAX_AMOUNT;
    }
    return null;
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
// Route to add a new tax year (admin only)
//  Send a POST request to the /tax/config route
// FRONT END FILE: /client/src/components/TaxYearForm.js
/* Creates the tax year only. An existing tax year is never overwritten, so a
mistake on the form cannot silently replace figures already in use. */
router.post('/config', checkJwtToken, checkAdmin, async (req, res) => {
    const config = parseTaxYearConfig(req.body)

    const validationMessage = validateTaxYearConfig(config)

    // Conditional rendering to check the submitted tax year is usable
    if (validationMessage) {
        console.warn('[WARN: taxRoutes.js, POST /config] Rejected:', validationMessage);
        return res.status(400).json({ success: false, message: validationMessage })// Send a 400 (Bad Request) status code with a message
    }

    try {
        // Conditional rendering to check the tax year has not been added already
        const existing = await TaxYearConfig.exists({ taxYear: config.taxYear });
        if (existing) {
            console.warn('[WARN: taxRoutes.js, POST /config] Tax year already exists', config.taxYear);
            return res.status(409).json({ success: false, message: `The ${config.taxYear} tax year already exists` });// Send a 409 (Conflict) status code with a message
        }

        const saved = await TaxYearConfig.create(config);

        console.log('[SUCCESS: taxRoutes.js, POST /config] Added tax year', saved.taxYear, 'by user', req.user.userId);
        return res.status(201).json({ success: true, message: `The ${saved.taxYear} tax year was added`, taxYear: saved.taxYear });// Return a 201 (Created) status code with a message
    } catch (error) {
        // Two admins adding the same year at once: the unique index catches the second
        if (error.code === 11000) {
            console.warn('[WARN: taxRoutes.js, POST /config] Duplicate tax year', config.taxYear);
            return res.status(409).json({ success: false, message: `The ${config.taxYear} tax year already exists` });
        }
        // A schema validation failure is the admin's input, not a server fault
        if (error.name === 'ValidationError') {
            console.error('[ERROR: taxRoutes.js, POST /config] Validation failed:', error.message);
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('[ERROR: taxRoutes.js, POST /config]', error.message);// Log an error message in the console for debugging purposes
        return res.status(500).json({ success: false, message: 'Internal Server Error' });// Return a 500 (Internal Server Error) status code with a message
    }
})

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
