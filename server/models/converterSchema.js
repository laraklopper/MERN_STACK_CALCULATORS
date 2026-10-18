// converterSchema.js
//IMPORT REQUIRED MODULES AND PACKAGES
const mongoose = require('mongoose');

// 
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

//========CURRENCY CONVERTER SCHEMA========
const currencyConvertSchema = new mongoose.Schema({//Define a new schema
    /* The user the saved conversion belongs to. Stored as a reference rather
    than relying on username, so a history lookup cannot return another user's
    conversions when two users share a name. */
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: [true, 'user is required'],
        index: true, 
    },
    //Current User username
    username: {
        type: String,
        required: [true, 'username is required'],
        trim: true,
        minlength: [2, 'Username must be at least 2 characters long'],
        maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    // ==============NESTED CURRENCY OBJECT=================
    currency: {
        // Field for base currency
        baseCurrency: {
            type: String,
            required: [true, 'base currency is required'],
            trim: true,
            uppercase: true,
            match: [CURRENCY_CODE_PATTERN, 'Base currency must be a 3-letter currency code'],
        },
        // Field for target currency
        targetCurrency:{
            type: String,
            required: [true, 'target currency is required'],
            trim: true,
            uppercase: true,
            match: [CURRENCY_CODE_PATTERN, 'Target currency must be a 3-letter currency code'],
        },
    },
    // Amount entered by the user in the base currency
    amount: {
        type: Number,
        required: [true, 'amount is required'],
        min: [0, 'Amount cannot be negative'],
    },
    // Exchange rate used for the conversion (target per base)
    rate:{
        type: Number,
        required: [true, 'rate is required'],
        min: [0, 'Rate cannot be negative'],
    }

}, {
    timestamps:true, 
    toJSON: {virtuals: true}, 
    toObject: {virtuals: true}
});

// Virtual field returning the converted amount (amount * rate)
currencyConvertSchema.virtual('convertedAmount').get(function (){
    return this.amount * this.rate;
})
module.exports = mongoose.model('currency', currencyConvertSchema)