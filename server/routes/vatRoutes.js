// vatRoutes.js
/* VAT endpoints, mounted at /vat by app.js.

  POST   /calculate   - work out the VAT on one amount (saves nothing)
  POST   /save        - save a calculation to the logged in user's history
  GET    /history     - the logged in user's saved calculations
  DELETE /history/:id - remove one of the logged in user's saved calculations

Nothing is looked up to answer a VAT calculation. Income tax needs a
TaxYearConfig and a currency conversion needs a rate snapshot, but SARS
publishes VAT as a single flat rate, so the maths in utils/calculationUtil.js is
all there is - which is why /calculate touches the database at all only through
the token check.

/save deliberately RECALCULATES from the user's inputs instead of storing the
figures the browser sends. A saved record is therefore always internally
consistent, and a tampered request cannot write a VAT amount that does not
reconcile against its own net and gross.
*/
/* Load environment variables from a .env
file using the dotenv package*/
require('dotenv').config()
//IMPORT REQUIRED MODULES AND PACKAGES
const express = require('express');
// IMPORT SCHEMAS
const User = require('../models/userSchema')
const VatCalc = require('../models/vatCalcSchema')
// IMPORT CUSTOM MIDDLEWARE
const { checkJwtToken } = require('../middleware/middleware');
// IMPORT UTILITY FUNCTIONS
const { VAT_MODES } = require('../util/schemaUtil');
const { calculateVat } = require('../util/utilFunc');

const router = express.Router()

/* Upper bound on the amount in the request, guarding against nonsense values
overflowing the maths. The same cap the income tax and provisional tax routes
apply. */
const MAX_AMOUNT = 1_000_000_000;

//=======INPUT VALIDATION=============
/* Reads the request body and coerces it to the shapes the maths expects, so
/calculate and /save parse a request in exactly the same way and cannot disagree
about what was asked for.

The amount is read from `amount` where the request carries one. VatCalculatorForm.js
sends the RESULT of its own local calculation rather than the raw input, so the
amount is otherwise recovered from the figure that was the input in that
direction: the net amount on an exclusive calculation, the gross on an inclusive
one. Recovering it is what lets /save recompute instead of trusting the totals. */
const parseVatInput = (body = {}) => {
    const mode = typeof body.mode === 'string' ? body.mode.trim().toLowerCase() : body.mode;
    /* A request that names no direction is taken as the commoner of the two: a
    price quoted without VAT, with VAT to be added. One that names an
    unrecognised direction is left as it arrived, so validation rejects it by
    name rather than silently working out something else. */
    const direction = mode === undefined || mode === null || mode === '' ? 'exclusive' : mode;

    /* The figure that was typed. Falls back to whichever of the two amounts is
    the input for this direction, never to the derived one. */
    const raw = body.amount ?? (
        direction === 'inclusive' ? body.grossAmount : body.netAmount
    );

    return {
        amount: parseFloat(raw),
        mode: direction,
        isZeroRated: Boolean(body.isZeroRated),
    };
};

/* Validates the body shared by /calculate and /save. Returns a message
describing the first problem found, or null when the input is usable.

This repeats the checks VatCalculatorForm.js already runs in the browser,
because the browser's copy can be bypassed - this is the one that decides what
reaches the maths and the database. */
const validateVatInput = (input) => {
    /* Conditional rendering to validate the amount. Nil is allowed through: a
    zero-rand line on an invoice is a legitimate thing to work VAT out on, and
    it produces a valid nil calculation rather than a meaningless one. */
    if (!Number.isFinite(input.amount) || input.amount < 0 || input.amount > MAX_AMOUNT) {
        return `amount must be a number between 0 and ${MAX_AMOUNT}`;
    }
    // Conditional rendering to validate which direction the calculation runs in
    if (!VAT_MODES.includes(input.mode)) {
        return `mode must be one of: ${VAT_MODES.join(', ')}`;
    }

    return null;
};

/*──────────────────────────── GET ROUTES ─────────────────────────────────────
   GET: READ — Used to fetch information from the database
────────────────────────────────────────────────────────────────────────────────*/
// Route to fetch Vat Calculation history
// Send a GET request to  /vat/history endpoint

/*──────────────────────────── POST ROUTES ──────────────────────────────
    POST: Used to create a new resource/submit data to the database
 ─────────────────────────────────────────────────────────────────────────*/
// Route to calculate VAT calculation
 //  Send a POST request to the /vat/calculate route
// FRONT END FILE: /client/src/components/VatCalculator.js
router.post('/calculate', checkJwtToken, async (req, res) => {
    const input = parseVatInput(req.body)

    const validationMessage = validateVatInput(input)

    if (validationMessage) {
        console.warn('[WARN: vatRoutes.js, /calculate] Rejected:', validationMessage);
        return res.status(400).json({ success: false, message: validationMessage })
    }

    try {
        const result = calculateVat(input)
        console.log('[SUCCESS: vatRoutes.js, /calculate] Calculated', input.mode, 'VAT at', result.ratePercent + '%');
        return res.status(200).json({ success: true, result });
    } catch (error) {
        console.error('[ERROR: vatRoutes.js, /calculate]', error.message);// Log an error message in the console for debugging purposes
        return res.status(500).json({ success: false, message: 'Internal Server Error' });// Return a 500 (Internal Server Error) status code with a message
    }
})
 //Route to save a Vat calculation
 //  Send a POST request to the /vat/save route
 // FRONT END FILE: /client/src/components/VatCalculator.js
router.post('/save', checkJwtToken, async (req, res) => {
    const input = parseVatInput(req.body)

    const validationMessage = validateVatInput(input)

    // Conditional rendering to check the submitted figures are usable
    if (validationMessage) {
        console.warn('[WARN: vatRoutes.js, /save] Rejected:', validationMessage);
        return res.status(400).json({ success: false, message: validationMessage })// Send a 400 (Bad Request) status code with a message
    }

    try {
        // The username is read from the database rather than trusted from the body
        const user = await User.findById(req.user.userId)
            .select('username')
            .exec();

        // Conditional rendering to check the user on the token still exists
        if (!user) {
            console.warn('[WARN: vatRoutes.js, /save] No user found for id', req.user.userId);
            return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
        }

        /* Recalculated from the inputs rather than stored as sent, so the saved
        record always reconciles (see the note at the top of this file). */
        const result = calculateVat(input)
        const saved = await VatCalc.create({
            user: user._id,
            username: user.username,
            mode: result.mode,
            isZeroRated: result.isZeroRated,
            ratePercent: result.ratePercent,
            netAmount: result.netAmount,
            vatAmount: result.vatAmount,
            grossAmount: result.grossAmount,
        });

        console.log('[SUCCESS: vatRoutes.js, /save] Saved VAT calculation', saved._id, 'for user', user._id);
        return res.status(201).json({ success: true, message: 'Calculation saved to your history', saved, result });// Return a 201 (Created) status code with the saved record
    } catch (error) {
        // A schema validation failure is the user's input, not a server fault
        if (error.name === 'ValidationError') {
            console.error('[ERROR: vatRoutes.js, /save] Validation failed:', error.message);
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('[ERROR: vatRoutes.js, /save]', error.message);// Log an error message in the console for debugging purposes
        return res.status(500).json({ success: false, message: 'Internal Server Error' });// Return a 500 (Internal Server Error) status code with a message
    }
})

 module.exports = router