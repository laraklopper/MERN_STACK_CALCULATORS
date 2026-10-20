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
/*FUNCTIONS */
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