// taxCalcSchema.js
/* A saved income tax calculation - the inputs the user entered and the result
the calculator worked out for them.*/
const mongoose = require('mongoose');
const { INCOME_TYPES } = require('../util/calculationUtil');

// One row of the bracket breakdown, as shown in the result table
const bracketBreakdownSchema = new mongoose.Schema({
    min: { type: Number, required: true },              // lower bound of the bracket (R)
    max: { type: Number, default: null },                // upper bound (R), null = no ceiling
    rate: { type: Number, required: true },              // marginal rate, e.g. 0.18 for 18%
    amountInBracket: { type: Number, required: true },   // income that fell into the bracket
    taxForBracket: { type: Number, required: true },     // tax on that slice of income
}, { _id: false });

const taxCalcSchema = new mongoose.Schema({
    /* The user the saved calculation belongs to. Stored as a reference rather
    than relying on username, so a history lookup cannot return another user's
    calculations when two users share a name. */
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'user is required'],
        index: true,
    },
    //Current loggedIn User username
    username: {
        type: String,
        required: [true, 'username is required'],
        trim: true,
        minlength: [2, 'Username must be at least 2 characters long'],
        maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    //HOW THE CALCULATION WAS ASKED FOR:
    // The tax year the calculation was worked out for, e.g. "2025-2026"
    taxYear: {
        type: String,
        required: [true, 'tax year is required'],
        trim: true,
    },
    // Whether the income entered was an annual or a monthly figure
    incomeType: {
        type: String,
        enum: {
            values: INCOME_TYPES,
            message: `incomeType must be one of: ${INCOME_TYPES.join(', ')}`,
        },
        required: [true, 'income type is required'],
    },
    // The income as the user entered it (annual or monthly, per incomeType)
    income: {
        type: Number,
        required: [true, 'income is required'],
        min: [0, 'Income cannot be negative'],
    },
    // The taxpayer's age, which decides the rebates and threshold
    age: {
        type: Number,
        required: [true, 'age is required'],
        min: [0, 'Age cannot be negative'],
    },
    /* Medical aid dependants. Recorded for reference only - no medical scheme
    fees tax credit is applied to the result. */
    dependants: {
        type: Number,
        default: 0,
        min: [0, 'Dependants cannot be negative'],
    },
    /*===========CALCULATED RESULT=================
    Worked out by util/utilFunc.js and stored so the record reproduces exactly
    what the user saw, even after the tax year's figures change. */
    // The income annualised (monthly x 12), which the brackets are applied to
    annualIncome: {
        type: Number,
        required: [true, 'annual income is required'],
        min: [0, 'Annual income cannot be negative'],
    },
    // Tax before rebates
    grossTax: {
        type: Number,
        required: [true, 'gross tax is required'],
        min: [0, 'Gross tax cannot be negative'],
    },
    // Rebate deducted from the gross tax
    rebate: {
        type: Number,
        required: [true, 'rebate is required'],
        min: [0, 'Rebate cannot be negative'],
    },
    // Tax payable for the year after rebates
    netTax: {
        type: Number,
        required: [true, 'net tax is required'],
        min: [0, 'Net tax cannot be negative'],
    },
    // Net tax as a percentage of the annual income
    effectiveRate: {
        type: Number,
        required: [true, 'effective rate is required'],
        min: [0, 'Effective rate cannot be negative'],
    },
    // Rate the top rand of income is taxed at, as a percentage
    marginalRate: {
        type: Number,
        required: [true, 'marginal rate is required'],
        min: [0, 'Marginal rate cannot be negative'],
    },
    bracketBreakdown: {
        type: [bracketBreakdownSchema],
        default: [],
    },
},{
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

/* Virtual field returning the net tax spread over the twelve months of the tax
year. Derived rather than stored, because it is always netTax / 12. */
taxCalcSchema.virtual('monthlyNetTax').get(function () {
    return Math.round((this.netTax / 12) * 100) / 100;
});

module.exports = mongoose.model('taxCalc', taxCalcSchema);
