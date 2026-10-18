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

