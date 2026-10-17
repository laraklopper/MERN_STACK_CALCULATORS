import { evaluate } from 'mathjs'

//===========================================================================
// BASIC CALCULATOR (NumberCalculator.js)
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