//calculationUtil.js
/* Variables used in routes relating to calculations 
*/
/* ====================
INTEREST ROUTES: interestRoutes.js
=========*/
/* Most saved calculations a single /history response will return. A user's
history grows without limit, so the newest records are returned and the total
is reported alongside them rather than the response growing unbounded. */
export const HISTORY_LIMIT = 100;
// Values the interest calculator accepts for the time period unit
export const PERIOD_UNITS = ['years', 'months'];
// Values the interest calculator accepts for the interest type
export const INTEREST_TYPES = ['simple', 'compound'];
// Number of times per year interest is compounded, per frequency name
export const COMPOUND_FREQUENCIES = {
    annually: 1,
    semiannually: 2,
    quarterly: 4,
    monthly: 12,
    daily: 365,
};

// Longest period accepted per unit, used by the route's validation
export const MAX_DURATION = {
    years: 100,
    months: 1200, // 100 years expressed in months
};
/*=====================================

===========*/

