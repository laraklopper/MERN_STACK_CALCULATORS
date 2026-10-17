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