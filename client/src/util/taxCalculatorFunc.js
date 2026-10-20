//taxCalculatorFunc.js
/*FILES
- Tax.js
- IncomeTaxCalculator.js
- ProvisionalTaxCalculator.js
- VatCalculator.js*/
/*-----------------------------
UNIVERSAL TAX CALCULATOR FUNCTIONS 
AND VARIABLES: 
functions and variables that apply to all tax Calculators
--------------------------*/
/* VARIABLES */

/*FUNCTIONS */
/*=================================
(INCOME) TAX CALCULATOR
=====================*/
/* VARIABLES */
// The tax calculator's inputs before the user has filled anything in
export const BLANK_TAX_FORM = {
    incomeType: "annual", // "annual" | "monthly"
    income: "",
    age: "",
    taxYear: "",
    dependants: "0",
};

// Upper bound on the income, mirroring MAX_AMOUNT in taxRoutes.js
export const MAX_TAX_INCOME = 1_000_000_000; 

/*FUNCTIONS */
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
/* VARIABLES */
// The provisional tax calculator's inputs before the user has filled anything in
export const BLANK_PROV_TAX_FORM = {
    period: 'first', // 'first' | 'second' | 'third'
    taxYear: '',
    // The estimate for the WHOLE year of assessment, not for the period
    estimatedIncome: '',
    age: '',
    employeesTax: '',
    foreignTaxCredits: '',
    medicalCredits: '',
    priorPayments: '',
    basicAmount: '',
};

/* The three IRP6 payments a provisional taxpayer makes in a year of assessment.
`value` is what the backend accepts as `period`; the rest is what the form shows,
so the calculator can explain which payment is being worked out without the
component holding the wording itself.

The first payment covers HALF the year's liability. The second squares up the
whole year, and the third is a voluntary top-up made after the year has ended -
what makes it smaller is the two payments already deducted from it, not a
smaller portion of the year. */
export const PROVISIONAL_PERIODS = [
    {
        value: 'first',
        label: 'FIRST',
        heading: 'First payment',
        portionLabel: '50% of the year’s liability',
        dueLabel: 'Due by the last day of the sixth month of the tax year',
        // Nothing can have been paid towards the year yet
        acceptsPriorPayments: false,
    },
    {
        value: 'second',
        label: 'SECOND',
        heading: 'Second payment',
        portionLabel: '100% of the year’s liability, less the first payment',
        dueLabel: 'Due by the last day of the tax year',
        acceptsPriorPayments: true,
    },
    {
        value: 'third',
        label: 'THIRD (TOP-UP)',
        heading: 'Third (top-up) payment',
        portionLabel: '100% of the year’s liability, less the first two payments',
        dueLabel: 'Voluntary, due seven months after the tax year ends',
        acceptsPriorPayments: true,
    },
];

/* The optional rand figures on the form. All four are left blank by a taxpayer
they do not apply to, so each is validated the same way (not negative) and sent
as 0 rather than as an empty string. */
export const PROV_TAX_OPTIONAL_AMOUNTS = [
    'employeesTax',
    'foreignTaxCredits',
    'medicalCredits',
    'priorPayments',
];

/*FUNCTIONS */
// Helper returning the config for the currently selected IRP6 period
export const provisionalPeriodConfig = (period) =>
    PROVISIONAL_PERIODS.find((p) => p.value === period) ?? PROVISIONAL_PERIODS[0];

/* Check the provisional tax calculator's inputs, returning a field -> message
object. An empty object means the form is good to submit.

An estimate BELOW the basic amount is not an error: paragraph 19(3) leaves that
to SARS to revise, so the result warns about it rather than the form refusing to
work the figures out. */
export const validateProvTaxForm = (form) => {
    const errs = {};
    const period = provisionalPeriodConfig(form.period);

    if (!form.estimatedIncome || Number(form.estimatedIncome) <= 0) {
        errs.estimatedIncome = 'Enter an estimated taxable income greater than 0';
    }
    if (!form.age || Number(form.age) < 16 || Number(form.age) > 120) {
        errs.age = 'Enter a valid age';
    }
    if (!form.taxYear) {
        errs.taxYear = 'Select a tax year';
    }
    if (!PROVISIONAL_PERIODS.some((p) => p.value === form.period)) {
        errs.period = 'Select which payment this is';
    }

    /* The optional amounts may be left blank, but not entered as negatives.
    Only the fields the SELECTED period actually shows are judged: a figure
    typed in before the period was changed is no longer on screen, so an error
    against it would be an error the user cannot see or clear. The payload
    drops those same fields, so nothing unchecked is ever sent. */
    [...PROV_TAX_OPTIONAL_AMOUNTS, 'basicAmount'].forEach((field) => {
        if (field === 'priorPayments' && !period.acceptsPriorPayments) return;
        if (field === 'basicAmount' && period.value === 'third') return;
        if (form[field] !== '' && Number(form[field]) < 0) {
            errs[field] = 'Cannot be negative';
        }
    });

    return errs;
}
/*===================================
VAT CALCULATOR 
===========================*/
/* VARIABLES */
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
/*FUNCTIONS */