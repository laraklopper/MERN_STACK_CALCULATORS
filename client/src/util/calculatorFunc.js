// calculatorFunc.js
/* Functions and variables that only apply to 
BasicCalculator.js, InterestCalculator.js and CurrencyConverter.js*/
import { evaluate } from 'mathjs'
// Shown in place of any detail a record does not carry
export const NOT_AVAILABLE = 'NOT AVAILABLE'

/*-----------------------------
UNIVERSAL TO BASIC and INTEREST CALCULATOR(s) FUNCTIONS 
AND VARIABLES: 
functions and variables that apply to all tax Calculators
--------------------------*/
/* VARIABLES */

/*FUNCTIONS */
//===========================================================================
// BASIC CALCULATOR (BasicCalculator.js)
//===========================================================================
/* True for the keys the basic calculator accepts from the keyboard: the digits,
the decimal point and the four operators. */
export const isCalculatorKey = (key) => /[0-9+\-*/.]/.test(key)

/* Work out a typed expression with math.js. The expression comes from the user,
so an unfinished one ("5 +") is expected rather than exceptional: a failure is
reported as `{ ok: false }` for the caller to show, instead of being thrown. */
export const evaluateExpression = (expression) => {
    try {
        return { ok: true, value: evaluate(expression) }
    } catch (error) {
        return { ok: false, value: null }
    }
}

//===========================================================================
// INTEREST CALCULATOR FORM (InterestCalculatorForm.js)
//===========================================================================
export const COMPOUND_FREQUENCIES = [
    { value: "annually", label: "Annually", timesPerYear: 1 },
    { value: "semiannually", label: "Semi-annually", timesPerYear: 2 },
    { value: "quarterly", label: "Quarterly", timesPerYear: 4 },
    { value: "monthly", label: "Monthly", timesPerYear: 12 },
    { value: "daily", label: "Daily", timesPerYear: 365 },
];

/* The time period options. `value` matches the `time.unit` enum the backend
stores, while `label` is what the user sees on the toggle buttons. */
export const PERIOD_UNITS = [
    { value: "years", label: "Annual", noun: "years", max: 100, placeholder: "10" },
    { value: "months", label: "Monthly", noun: "months", max: 1200, placeholder: "18" },
];

// Helper returning the config for the currently selected time period unit
export const periodConfig = (unit) =>
    PERIOD_UNITS.find((p) => p.value === unit) ?? PERIOD_UNITS[0];

// The interest calculator's inputs before the user has filled anything in
export const BLANK_INTEREST_FORM = {
    type: "compound", // "simple" | "compound"
    principal: "",
    rate: "",
    time: "",
    periodUnit: "years", // "years" (annual) | "months" (monthly)
    compoundingFrequency: "annually",
    monthlyContribution: "",
};

/* Check the interest form before it is sent, mirroring the backend's rules so
the user sees a message beside the field instead of a failed request. Returns
an object of field -> message; an empty object means the form is usable. */
export const validateInterestForm = (form) => {
    const errors = {};
    const period = periodConfig(form.periodUnit);
    const principal = parseFloat(form.principal);
    const rate = parseFloat(form.rate);
    const time = Number(form.time);

    if (isNaN(principal) || principal <= 0) {
        errors.principal = "Enter a principal amount greater than 0.";
    }
    if (isNaN(rate) || rate <= 0 || rate > 100) {
        errors.rate = "Enter an interest rate greater than 0 and no more than 100.";
    }
    if (form.time === "" || !Number.isInteger(time) || time < 1 || time > period.max) {
        errors.time = `Enter a whole number of ${period.noun} between 1 and ${period.max}.`;
    }
    // The contribution is optional, so only check it when something was entered
    if (form.monthlyContribution !== "") {
        const contribution = parseFloat(form.monthlyContribution);
        if (isNaN(contribution) || contribution < 0) {
            errors.monthlyContribution = "Enter a contribution of 0 or more.";
        }
    }
    return errors;
};

/* Map the form's fields onto the body the /interest/calculate and
/interest/save routes expect. The form calls the length `time`, while the
backend calls it `duration`. */
export const toInterestPayload = (form) => ({
    type: form.type,
    principal: form.principal,
    rate: form.rate,
    duration: form.time,
    periodUnit: form.periodUnit,
    compoundingFrequency: form.compoundingFrequency,
    monthlyContribution: form.monthlyContribution,
});

/*=================================
TAX CALCULATOR
=====================*/
// The tax calculator's inputs before the user has filled anything in
export const BLANK_TAX_FORM = {
    incomeType: "annual", // "annual" | "monthly"
    income: "",
    age: "",
    taxYear: "",
    dependants: "0",
};
// Format a percentage held as a number, e.g. 26.5 as 26.50%
export const formatPercent = (value) => `${(value || 0).toFixed(2)}%`;

// Upper bound on the income, mirroring MAX_AMOUNT in taxRoutes.js
export const MAX_TAX_INCOME = 1_000_000_000;

/* Check the tax form before it is sent, mirroring the backend's rules in
taxRoutes.js so the user sees a message beside the field instead of a failed
request. Returns an object of field -> message; an empty object means the form
is usable. */
export const validateTaxForm = (form) => {
    const errors = {};
    const income = parseFloat(form.income);
    const age = Number(form.age);

    if (form.income === "" || !Number.isFinite(income) || income < 0 || income > MAX_TAX_INCOME) {
        errors.income = "Enter an income of 0 or more.";
    }
    if (form.age === "" || !Number.isInteger(age) || age < 16 || age > 120) {
        errors.age = "Enter your age as a whole number between 16 and 120.";
    }
    if (!form.taxYear) {
        errors.taxYear = "Select a tax year.";
    }
    // Dependants are optional, so only check them when something was entered
    if (form.dependants !== "") {
        const dependants = Number(form.dependants);
        if (!Number.isInteger(dependants) || dependants < 0 || dependants > 50) {
            errors.dependants = "Enter a whole number of dependants between 0 and 50.";
        }
    }
    return errors;
};

// Map the form's fields onto the body the /tax/calculate and /tax/save routes expect
export const toTaxPayload = (form) => ({
    incomeType: form.incomeType,
    income: form.income,
    age: form.age,
    taxYear: form.taxYear,
    dependants: form.dependants,
});

/*=====================
PROVISIONAL TAX CALCULATOR
====================*/


/*===================================
VAT CALCULATOR 
===========================*/

// VARIABLES
export const ZERO_RATED_CATEGORIES = [
  'Brown bread',
  'Maize meal',
  'Rice',
  'Vegetables',
  'Fruit',
  'Milk',
  'Eggs',
  'Vegetable oil',
  'Dried beans',
  'Lentils',
  'Paraffin',
  'Brown wheaten meal',
  'Pilchards/sardinella in tins',
];

// SARS standard VAT rate. Centralised here so a future rate change
// (as nearly happened for 2025/2026) only needs updating in one place.
export const SARS_VAT_RATE = 0.15;
