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
const User = require('../models/userSchema')
const ProvTaxCalc = require('../models/provTaxCalcSchema')

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
        taxYear: typeof body.taxYear === 'string' ? body.taxYear.trim() : body.taxYear,
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

/*──────────────────────────── POST ROUTES ──────────────────────────────
    POST: Used to create a new resource/submit data to the database
 ─────────────────────────────────────────────────────────────────────────*/
// Route to calculateProvisionalTax
// Send A POST request to /provisional/calculate endpoint
router.post('/calculate', async (req,res) => {
    
})

module.exports = router