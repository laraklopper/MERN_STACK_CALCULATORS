//calculationUtil.js
/* Variables used in routes relating to calculations
*/
/* ====================
INTEREST ROUTES: interestRoutes.js
=========*/
/* Most saved calculations a single /history response will return. A user's
history grows without limit, so the newest records are returned and the total
is reported alongside them rather than the response growing unbounded. */
const HISTORY_LIMIT = 100;
// Values the interest calculator accepts for the time period unit
const PERIOD_UNITS = ['years', 'months'];
// Values the interest calculator accepts for the interest type
const INTEREST_TYPES = ['simple', 'compound'];
// Number of times per year interest is compounded, per frequency name
const COMPOUND_FREQUENCIES = {
    annually: 1,
    semiannually: 2,
    quarterly: 4,
    monthly: 12,
    daily: 365,
};

// Longest period accepted per unit, used by the route's validation
const MAX_DURATION = {
    years: 100,
    months: 1200, // 100 years expressed in months
};
/*=====================================
INCOME TAX ROUTES: taxRoutes.js
===========*/
// Values the income tax calculator accepts for the income period
const INCOME_TYPES = ['annual', 'monthly'];
// Age range the income tax calculator accepts (matches the form's min/max)
const MIN_TAX_AGE = 16;
const MAX_TAX_AGE = 120;
// Most medical aid dependants a calculation will record
const MAX_DEPENDANTS = 50;
// Ages from which the SARS secondary and tertiary rebates apply
const SECONDARY_REBATE_AGE = 65;
const TERTIARY_REBATE_AGE = 75;

/* The server is a CommonJS project ("type": "commonjs" in package.json), so
the values are exported with module.exports for require() to pick up. */
module.exports = {
    HISTORY_LIMIT, PERIOD_UNITS, INTEREST_TYPES, COMPOUND_FREQUENCIES, MAX_DURATION,
    INCOME_TYPES, MIN_TAX_AGE, MAX_TAX_AGE, MAX_DEPENDANTS, SECONDARY_REBATE_AGE, TERTIARY_REBATE_AGE,
};
