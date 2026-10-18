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

===========*/

/* The server is a CommonJS project ("type": "commonjs" in package.json), so
the values are exported with module.exports for require() to pick up. */
module.exports = { HISTORY_LIMIT, PERIOD_UNITS, INTEREST_TYPES, COMPOUND_FREQUENCIES, MAX_DURATION };
