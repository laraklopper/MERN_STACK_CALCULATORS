// provTaxCalcSchema.js
/* A saved provisional tax (IRP6) calculation - the inputs the user entered and
the result the calculator worked out for them.*/
const mongoose = require('mongoose');
const { PROVISIONAL_PERIODS } = require('../util/calculationUtil');

// One row of the working, as shown in the result table
const provBreakdownSchema = new mongoose.Schema({
    label: { type: String, required: true },    // what the row is, e.g. "Less: rebates"
    amount: { type: Number, required: true },   // the rand figure for the row
    // 'line' a figure, 'deduct' comes off it, 'subtotal' / 'total' a result
    type: { type: String, enum: ['line', 'deduct', 'subtotal', 'total'], required: true },
}, { _id: false });

// Rand figures that can never be negative share the same definition
const amount = (label) => ({
    type: Number,
    default: 0,
    min: [0, `${label} cannot be negative`],
});

const provTaxCalcSchema = new mongoose.Schema({
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
    // Which of the three IRP6 payments was worked out
    period: {
        type: String,
        enum: {
            values: PROVISIONAL_PERIODS,
            message: `period must be one of: ${PROVISIONAL_PERIODS.join(', ')}`,
        },
        required: [true, 'period is required'],
    },
    // The estimate for the WHOLE year of assessment
    estimatedTaxableIncome: {
        type: Number,
        required: [true, 'estimated taxable income is required'],
        min: [0, 'Estimated taxable income cannot be negative'],
    },
    // The taxpayer's age, which decides the rebates and threshold
    age: {
        type: Number,
        required: [true, 'age is required'],
        min: [0, 'Age cannot be negative'],
    },
    // Last assessed taxable income. Null when none was supplied, which is not the same as nil
    basicAmount: {
        type: Number,
        default: null,
        min: [0, 'Basic amount cannot be negative'],
    },
    employeesTax: amount("Employees' tax"),
    foreignTaxCredits: amount('Foreign tax credits'),
    medicalCredits: amount('Medical scheme fees tax credits'),
    priorPayments: amount('Provisional tax already paid'),
    /*===========CALCULATED RESULT=================
    Worked out by util/utilFunc.js and stored so the record reproduces exactly
    what the user saw, even after the tax year's figures change. */
    // Share of the year's liability this payment covers, e.g. 0.5
    portion: {
        type: Number,
        required: [true, 'portion is required'],
        min: [0, 'Portion cannot be negative'],
        max: [1, 'Portion cannot exceed 1'],
    },
    // The date the IRP6 falls due, or null where the tax year has no dates
    dueDate: {
        type: Date,
        default: null,
    },
    grossTax: amount('Gross tax'),
    rebate: amount('Rebate'),
    medicalCreditsApplied: amount('Medical credits applied'),
    annualTaxLiability: amount('Annual tax liability'),
    taxForPeriod: amount('Tax for the period'),
    totalCredits: amount('Total credits'),
    amountPayable: amount('Amount payable'),
    overpaid: amount('Overpaid amount'),
    effectiveRate: amount('Effective rate'),
    marginalRate: amount('Marginal rate'),
    breakdown: {
        type: [provBreakdownSchema],
        default: [],
    },
    warnings: {
        type: [String],
        default: [],
    },
},{
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

module.exports = mongoose.model('provTaxCalc', provTaxCalcSchema);
