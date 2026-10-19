const { COMPOUND_FREQUENCIES } = require("./calculationUtil");
const { SARS_VAT_RATE } = require("./schemaUtil");

// Round a money figure to 2 decimal places (cents)
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/*=============================
INTEREST CALCULATION
==============================*/
/* Simulates the balance one month at a time - the finest granularity the form
allows for contributions - then groups those months into the reporting period
the user asked for (one row per month, or one row per year).

Compound interest is grown by the monthly equivalent of the selected
compounding frequency: (1 + r/n)^(n/12). Over twelve months this multiplies
out to exactly (1 + r/n)^n, so the annual total still matches the standard
compound interest formula while giving a usable month-by-month breakdown.

Simple interest is only ever charged on capital paid in (the principal plus
any recurring contributions), never on interest already earned. */
const calculateInterest = ({
    type = 'simple',
    principal,
    rate,
    duration,
    periodUnit = 'years',
    compoundingFrequency = 'annually',
    monthlyContribution = 0,
}) => {
    const unit = periodUnit === 'months' ? 'months' : 'years';
    const isCompound = type === 'compound';

    const annualRate = rate / 100;// Convert the percentage to a decimal
    const contribution = Number(monthlyContribution) || 0;
    // Months to simulate, and how many of those months make up one output row
    const totalMonths = Math.round(unit === 'months' ? duration : duration * 12);
    const monthsPerRow = unit === 'months' ? 1 : 12;

    // Times per year interest is compounded (only relevant for compound interest)
    const timesPerYear = COMPOUND_FREQUENCIES[compoundingFrequency] || 1;
    /* Monthly growth factor for compound interest. Falls back to 1 for simple
    interest, where growth is worked out from the capital base instead. */
    const monthlyGrowth = isCompound
        ? Math.pow(1 + annualRate / timesPerYear, timesPerYear / 12)
        : 1;
    const monthlySimpleRate = annualRate / 12;// Simple interest accrued per month

    let balance = principal;// Running balance, including interest earned
    let capitalBase = principal;// Capital paid in, used for simple interest only
    let totalInterest = 0;
    let totalContributions = 0;
    // Totals for the row currently being built up
    let rowInterest = 0;
    let rowContributions = 0;
    const breakdown = [];

    for (let month = 1; month <= totalMonths; month++) {
        // Interest for this month, then add it to the balance
        const interest = isCompound
            ? balance * (monthlyGrowth - 1)
            : capitalBase * monthlySimpleRate;
        balance += interest;
        totalInterest += interest;
        rowInterest += interest;

        // Recurring contribution is paid in at the end of the month
        if (contribution > 0) {
            balance += contribution;
            capitalBase += contribution;
            totalContributions += contribution;
            rowContributions += contribution;
        }

        /* Close off a row on every reporting boundary, and always on the final
        month so a part-year is still reported rather than silently dropped. */
        if (month % monthsPerRow === 0 || month === totalMonths) {
            breakdown.push({
                period: breakdown.length + 1,
                contributions: round2(rowContributions),
                interest: round2(rowInterest),
                balance: round2(balance),
            });
            rowInterest = 0;
            rowContributions = 0;
        }
    }

    return {
        type: isCompound ? 'compound' : 'simple',
        principal: round2(principal),
        rate,
        duration,
        periodUnit: unit,
        // Label used by the client for the breakdown table's first column
        periodLabel: unit === 'months' ? 'month' : 'year',
        durationInMonths: totalMonths,
        compoundingFrequency: isCompound ? compoundingFrequency : null,
        monthlyContribution: contribution,
        totalContributions: round2(totalContributions),
        totalInterest: round2(totalInterest),
        finalAmount: round2(balance),
        breakdown,
    };
};

/*=============================
VAT CALCULATION
==============================*/
/* Works out the net, VAT and gross figures for one amount.

'exclusive': the amount is the price BEFORE VAT, so VAT is added on top.
'inclusive': the amount is the price AFTER VAT, so the VAT in it is stripped
back out by dividing by (1 + rate).

A zero-rated item is still a taxable supply, just at 0%, so it runs through
the same maths with a rate of nil and comes out with net = gross. */
const calculateVat = ({ amount, mode = 'exclusive', isZeroRated = false }) => {
    const rate = isZeroRated ? 0 : SARS_VAT_RATE;
    const direction = mode === 'inclusive' ? 'inclusive' : 'exclusive';

    let netAmount;
    let grossAmount;
    if (direction === 'inclusive') {
        grossAmount = round2(amount);
        netAmount = round2(amount / (1 + rate));
    } else {
        netAmount = round2(amount);
        grossAmount = round2(amount * (1 + rate));
    }
    /* VAT is the difference between the two rounded figures, so the three
    amounts always reconcile to the cent. */
    const vatAmount = round2(grossAmount - netAmount);

    return {
        amount: round2(amount),
        mode: direction,
        isZeroRated: Boolean(isZeroRated),
        ratePercent: round2(rate * 100),
        netAmount,
        vatAmount,
        grossAmount,
    };
};

module.exports = { calculateInterest, calculateVat, round2 };