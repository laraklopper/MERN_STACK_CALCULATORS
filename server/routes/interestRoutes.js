// interestRoutes.js
/* Interest calculator endpoints, mounted at /interest by app.js.

  POST   /calculate   - work out simple or compound interest (saves nothing)
  POST   /save        - save a calculation to the logged in user's history
  GET    /history     - the logged in user's saved calculations
  DELETE /history/:id - remove one of the logged in user's saved calculations*/

  /* Load environment variables from a .env
file using the dotenv package*/
require('dotenv').config()
// IMPORT REQUIRED MODULES AND PACKAGES
const express = require('express');
const Interest = require('../models/interestSchema')
const User = require('../models/userSchema.js')
const { checkJwtToken } = require('../middleware/middleware');
const {PERIOD_UNITS, INTEREST_TYPES, COMPOUND_FREQUENCIES, MAX_DURATION} = require('../util/calculationUtil')
const {calculateInterest} = require('../util/utilFunc')
const router = express.Router()



/*=====================================
INTEREST INPUT PARSING AND VALIDATION
=======================================*/
/* Function: Reads the interest calculator's fields off a request body and coerces them
to numbers. Shared by /calculate and /save so both routes parse a request in
exactly the same way. */
const parseInterestInput = (body = {}) => ({
    type: body.type,
    principal: parseFloat(body.principal),
    rate: parseFloat(body.rate),
    duration: Number(body.duration),
    periodUnit: body.periodUnit,
    compoundingFrequency: body.compoundingFrequency,
    // The recurring monthly contribution is optional, so default it to 0
    monthlyContribution: body.monthlyContribution === undefined || body.monthlyContribution === null || body.monthlyContribution === ''
        ? 0
        : parseFloat(body.monthlyContribution),
});

/* Function to validate a parsed interest request. 
Returns a message describing the first problem found, or null when the input is usable. */
const validateInterestInput = ({ type, principal, rate, duration, periodUnit, compoundingFrequency, monthlyContribution }) => {
    // Conditional rendering to check the interest type is one that is supported
    if (!INTEREST_TYPES.includes(type)) {
        return `type must be one of: ${INTEREST_TYPES.join(', ')}`;
    }
    // Conditional rendering to check the time period unit is one that is supported
    if (!PERIOD_UNITS.includes(periodUnit)) {
        return `periodUnit must be one of: ${PERIOD_UNITS.join(', ')}`;
    }
    // Conditional rendering to validate that the principal is a positive number
    if (isNaN(principal) || principal <= 0) {
        return 'principal must be a number greater than 0';
    }
    // Conditional rendering to validate that the rate is a percentage between 0 and 100
    if (isNaN(rate) || rate <= 0 || rate > 100) {
        return 'rate must be a number greater than 0 and no more than 100';
    }
    /* Conditional rendering to validate the duration: whole periods only, and
    capped per unit so a single request cannot ask for a huge breakdown. */
    if (!Number.isInteger(duration) || duration <= 0 || duration > MAX_DURATION[periodUnit]) {
        return `duration must be a whole number of ${periodUnit} between 1 and ${MAX_DURATION[periodUnit]}`;
    }
    /* Conditional rendering to validate the compounding frequency. Only
    required for compound interest; simple interest ignores it. */
    if (type === 'compound' && !Object.keys(COMPOUND_FREQUENCIES).includes(compoundingFrequency)) {
        return `compoundingFrequency must be one of: ${Object.keys(COMPOUND_FREQUENCIES).join(', ')}`;
    }
    // Conditional rendering to validate that the contribution is not negative
    if (isNaN(monthlyContribution) || monthlyContribution < 0) {
        return 'monthlyContribution must be a number of 0 or more';
    }
    return null;
};

/*──────────────────────────── GET ROUTES ───────────────────────────────
    GET: READ — Used to fetch information from the database
 ─────────────────────────────────────────────────────────────────────────
    - GET:   /history     - the logged in user's saved calculations
 */

/*──────────────────────────── POST ROUTES ──────────────────────────────
    POST: Used to create a new resource/submit data to the database
 ─────────────────────────────────────────────────────────────────────────
- POST:   /calculate   - work out simple or compound interest (returns a result, saves nothing)
- POST:  /save        - save a calculation to the logged in user's history
*/

/* Route to calculate interest: 
Send a POST request to the /interest/calculate route
FRONT END FILE: /client/src/pages/Calculators.js*/
router.post('/calculate', checkJwtToken ,async (req, res) => {
    const input = parseInterestInput(req.body)

     const validationMessage = validateInterestInput(input);
    // Conditional rendering to check the submitted figures are usable
    if (validationMessage) {
        return res.status(400).json({ success: false, message: validationMessage });// Send a 400 (Bad Request) status code with a message
    }
    try {
        const result  = calculateInterest(input)
        console.log('[SUCCESS: interestRoutes.js, /calculate] Calculated', input.type, 'interest over', input.duration, input.periodUnit);
        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('[ERROR: interestRoutes.js, /calculate]', error.message);// Log an error message in the console for debugging purposes
        return res.status(500).json(// Return a 500 (Internal Server Error) status code with a message
            { 
                success: false, //Success Status
                message: 'Internal Server Error' //Json Message
            });
    }
})

// 
/*Route to save a calculation
Sends a POST request to the /interest/save route
FRONT END FILE: /client/src/pages/Calculators.js*/
router.post('/save', checkJwtToken, async (req, res) => {
    const input = parseInterestInput(req.body);

    const validationMessage = validateInterestInput(input) 

    // Conditional rendering to check the submitted figuresare usable
    if (validationMessage) {
        return res.status(400).json({ success: false, message: validationMessage });// Send a 400 (Bad Request) status code with a message
    }

    try {
        // The username is read from the database rather than trusted from the body
        const user = await User.findById(req.user.userId)
            .select('username')
            .exec();
       
       // Conditional rendering to check the user on the token still exists
        if (!user) {
            console.warn('[WARN: interestRoutes.js, /save] No user found for id', req.user.userId);
            return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
        }
        const result = calculateInterest(input);
        const saved = await Interest.create({
            user: user._id,
            username: user.username,
            principal: result.principal,
            interestRate: result.rate,
            // The schema stores the duration and its unit separately
            time: { duration: input.duration, unit: result.periodUnit },
            interestType: result.type,
            /* The schema stores the compounding frequency as a NUMBER of times
            per year, so the frequency name is mapped to its count here. Simple
            interest does not compound, so it falls back to 1. */
            compoundFrequency: COMPOUND_FREQUENCIES[input.compoundingFrequency] || 1,
            monthlyContribution: result.monthlyContribution,
            totalContributions: result.totalContributions,
            totalInterest: result.totalInterest,
            finalAmount: result.finalAmount,
        });
        
        console.log('[SUCCESS: interestRoutes.js, /save] Saved interest calculation', saved._id, 'for user', user._id);
        return res.status(201).json({ success: true, message: 'Calculation saved to your history', saved, result });
    } catch (error) {
        // A schema validation failure is the user's input, not a server fault
        if (error.name === 'ValidationError') {
            console.error('[ERROR: interestRoutes.js, /save] Validation failed:', error.message);
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('[ERROR: interestRoutes.js, /save]', error.message);// Log an error message in the console for debugging purposes
        return res.status(500).json({ success: false, message: 'Internal Server Error' });// Return a 500 (Internal Server Error) status code with a message
    }
})

module.exports = router