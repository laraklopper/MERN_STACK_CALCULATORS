const {
    COMPOUND_FREQUENCIES, SECONDARY_REBATE_AGE, TERTIARY_REBATE_AGE,
    PROVISIONAL_PORTIONS, PROVISIONAL_PERIOD_LABELS, PROVISIONAL_ESTIMATE_THRESHOLD,
} = require("./calculationUtil");
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

/*=============================
INCOME TAX CALCULATION
==============================*/
/* Works out SARS income tax for one tax year from its configuration
(a TaxYearConfig document, or the seed data in dataArrays/taxSeedData.js).

A monthly income is annualised (x12) first, because the brackets, rebates and
thresholds are all annual figures. Gross tax is the bracket's base amount plus
the marginal rate on the income above the bracket's lower bound. The rebates
are then deducted: primary for everyone, secondary from 65, tertiary from 75.
Tax can never be negative, so a rebate larger than the gross tax leaves nil.

The bracket breakdown shows how much of the income fell into each bracket and
the tax on that slice, so the user can see where the gross tax came from. */
const calculateIncomeTax = ({ income, incomeType = 'annual', age, dependants = 0 }, config) => {
    const period = incomeType === 'monthly' ? 'monthly' : 'annual';
    const annualIncome = period === 'monthly' ? income * 12 : income;

    // Brackets sorted by lower bound, so the breakdown reads from lowest to highest
    const brackets = [...config.brackets].sort((a, b) => a.min - b.min);

    /* The bracket the top rand of income falls into. SARS brackets start at
    R1, so a lower bound of `min` means income ABOVE `min - 1` is taxed at it. */
    const bracket = brackets.find((b) =>
        annualIncome >= b.min && (b.max === null || b.max === undefined || annualIncome <= b.max)
    );

    const grossTax = bracket
        ? bracket.baseAmount + (annualIncome - (bracket.min - 1)) * bracket.rate
        : 0;

    const bracketBreakdown = [];
    for (const b of brackets) {
        const lower = b.min - 1;
        const upper = b.max === null || b.max === undefined ? Infinity : b.max;
        const amountInBracket = Math.min(annualIncome, upper) - lower;
        if (amountInBracket <= 0) break;
        bracketBreakdown.push({
            min: b.min,
            max: b.max ?? null,
            rate: b.rate,
            amountInBracket: round2(amountInBracket),
            taxForBracket: round2(amountInBracket * b.rate),
        });
    }

    // Rebates the taxpayer's age entitles them to
    let rebate = config.rebates.primary;
    if (age >= SECONDARY_REBATE_AGE) rebate += config.rebates.secondary;
    if (age >= TERTIARY_REBATE_AGE) rebate += config.rebates.tertiary;

    // The tax threshold for the taxpayer's age group
    const threshold = age >= TERTIARY_REBATE_AGE
        ? config.thresholds.age75plus
        : age >= SECONDARY_REBATE_AGE
        ? config.thresholds.age65to74
        : config.thresholds.under65;

    /* Rebate actually used against the tax: never more than the gross tax, so
    the figures on the result reconcile (gross - rebate = net). */
    const rebateApplied = Math.min(rebate, grossTax);
    const netTax = annualIncome <= threshold ? 0 : Math.max(0, grossTax - rebateApplied);

    return {
        taxYear: config.taxYear,
        incomeType: period,
        income: round2(income),
        annualIncome: round2(annualIncome),
        age,
        dependants,
        threshold,
        belowThreshold: annualIncome <= threshold,
        grossTax: round2(grossTax),
        rebate: round2(rebateApplied),
        netTax: round2(netTax),
        monthlyNetTax: round2(netTax / 12),
        // Both rates are percentages, e.g. 18 for 18%
        effectiveRate: annualIncome > 0 ? round2((netTax / annualIncome) * 100) : 0,
        marginalRate: bracket ? round2(bracket.rate * 100) : 0,
        bracketBreakdown,
    };
};

/*=============================
PROVISIONAL TAX CALCULATION
==============================*/
/* Formats a UTC date as YYYY-MM-DD, the shape the client expects for dueDate */
const toIsoDate = (date) => date.toISOString().slice(0, 10);

/* Works out when an IRP6 falls due from the tax year's start and end dates.
Returns a YYYY-MM-DD string, or null when the tax year has no usable dates.

  first  - last day of the sixth month of the year of assessment
  second - last day of the year of assessment
  third  - last day of the seventh month after a February year end

The config dates arrive either as Date objects (from the database) or as
YYYY-MM-DD strings (from the seed data); both are read as UTC so the day
cannot shift with the server's time zone. Date.UTC(y, m, 0) is the last day of
month m - 1, which is what makes the month arithmetic below work. */
const provisionalDueDate = (period, config) => {
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    if (period === 'first') {
        return toIsoDate(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 6, 0)));
    }
    if (period === 'second') {
        return toIsoDate(new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)));
    }
    return toIsoDate(new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 8, 0)));
};

/* Works out what is payable on one IRP6, laid out the way the return is:

  1. Normal tax on the estimated taxable income for the WHOLE year, using the
     same brackets, rebates and thresholds as calculateIncomeTax.
  2. Less the medical scheme fees tax credits for the year. The credit is
     non-refundable, so it can bring the tax down to nil but not below it.
  3. The portion this payment covers: half the year for the first payment,
     the whole year for the second and the top-up. The portion is taken off
     the TAX, not the income, because the brackets are annual and progressive.
  4. Less employees' tax, foreign tax credits and provisional tax already paid.

An IRP6 cannot ask for a negative payment, so the amount payable is floored at
nil and any surplus is reported separately as `overpaid`. */
const calculateProvisionalTax = ({
    period,
    estimatedTaxableIncome,
    age,
    employeesTax = 0,
    foreignTaxCredits = 0,
    medicalCredits = 0,
    priorPayments = 0,
    basicAmount = null,
}, config) => {
    const incomeTax = calculateIncomeTax({ income: estimatedTaxableIncome, incomeType: 'annual', age }, config);
    const portion = PROVISIONAL_PORTIONS[period];
    const periodLabel = PROVISIONAL_PERIOD_LABELS[period];

    // Nothing can have been paid towards the year before its first payment
    const priorPaid = period === 'first' ? 0 : priorPayments;

    const medicalCreditsApplied = Math.min(medicalCredits, incomeTax.netTax);
    const annualTaxLiability = incomeTax.netTax - medicalCreditsApplied;
    const taxForPeriod = round2(annualTaxLiability * portion);
    const totalCredits = round2(employeesTax + foreignTaxCredits + priorPaid);
    const amountPayable = round2(Math.max(0, taxForPeriod - totalCredits));
    const overpaid = round2(Math.max(0, totalCredits - taxForPeriod));

    //========THE WORKING, AS AN IRP6 LAYS IT OUT========
    // type: 'line' a figure, 'deduct' comes off it, 'subtotal' / 'total' a result
    const breakdown = [
        { label: 'Tax on estimated taxable income', amount: incomeTax.grossTax, type: 'line' },
        /* Gross less net rather than the rebate itself, so the rows still add up
        when the estimate is under the threshold and the tax is nil outright */
        { label: 'Less: rebates', amount: round2(incomeTax.grossTax - incomeTax.netTax), type: 'deduct' },
    ];
    if (medicalCreditsApplied > 0) {
        breakdown.push({ label: 'Less: medical scheme fees tax credits', amount: round2(medicalCreditsApplied), type: 'deduct' });
    }
    breakdown.push({ label: 'Tax liability for the year', amount: round2(annualTaxLiability), type: 'subtotal' });
    breakdown.push({ label: `Tax for this period (${portion * 100}% of the year)`, amount: taxForPeriod, type: 'subtotal' });
    if (employeesTax > 0) {
        breakdown.push({ label: "Less: employees' tax (PAYE)", amount: round2(employeesTax), type: 'deduct' });
    }
    if (foreignTaxCredits > 0) {
        breakdown.push({ label: 'Less: foreign tax credits', amount: round2(foreignTaxCredits), type: 'deduct' });
    }
    if (priorPaid > 0) {
        breakdown.push({ label: 'Less: provisional tax already paid', amount: round2(priorPaid), type: 'deduct' });
    }
    breakdown.push({ label: 'Amount payable', amount: amountPayable, type: 'total' });

    //========WHAT THE FIGURES CANNOT SHOW========
    const warnings = [];
    if (incomeTax.belowThreshold) {
        warnings.push(`The estimate is at or below the tax threshold of R${incomeTax.threshold.toLocaleString('en-ZA')} for your age, so no tax is due on it.`);
    }
    if (medicalCredits > medicalCreditsApplied) {
        warnings.push('The medical scheme fees tax credits exceed the tax for the year. The credit is not refundable, so only the part that brings the tax to nil has been used.');
    }
    /* Paragraph 19(3): SARS may increase an estimate it considers too low. Only
    the first two payments are estimates; the top-up is made after year end. */
    if (period !== 'third' && basicAmount !== null && estimatedTaxableIncome < basicAmount) {
        warnings.push('The estimate is below the basic amount (your last assessed taxable income). SARS may require you to justify it, and may increase it.');
    }
    // Paragraph 20: the underestimation penalty is judged on the second estimate
    if (period === 'second') {
        warnings.push(estimatedTaxableIncome > PROVISIONAL_ESTIMATE_THRESHOLD
            ? 'Where taxable income is over R1 000 000, an estimate below 80% of the actual taxable income attracts an underestimation penalty of 20% of the shortfall in tax.'
            : 'Where taxable income is R1 000 000 or less, an estimate below both 90% of the actual taxable income and the basic amount attracts an underestimation penalty of 20% of the shortfall in tax.');
    }
    if (period === 'third') {
        warnings.push('A top-up made by the due date avoids interest on any tax still owing when the year is assessed.');
    } else {
        warnings.push('A late payment attracts a 10% penalty on the amount payable, plus interest from the due date.');
    }

    return {
        taxYear: config.taxYear,
        period,
        periodLabel,
        portion,
        dueDate: provisionalDueDate(period, config),
        // The inputs, echoed back so the client can save exactly what was shown
        estimatedTaxableIncome: round2(estimatedTaxableIncome),
        age,
        basicAmount: basicAmount === null ? null : round2(basicAmount),
        employeesTax: round2(employeesTax),
        foreignTaxCredits: round2(foreignTaxCredits),
        medicalCredits: round2(medicalCredits),
        priorPayments: round2(priorPaid),
        // The result
        grossTax: incomeTax.grossTax,
        rebate: incomeTax.rebate,
        medicalCreditsApplied: round2(medicalCreditsApplied),
        annualTaxLiability: round2(annualTaxLiability),
        taxForPeriod,
        totalCredits,
        amountPayable,
        overpaid,
        // Both rates are percentages, e.g. 18 for 18%
        effectiveRate: round2((annualTaxLiability / estimatedTaxableIncome) * 100),
        marginalRate: incomeTax.marginalRate,
        breakdown,
        warnings,
    };
};

module.exports = { calculateInterest, calculateVat, calculateIncomeTax, calculateProvisionalTax, round2 };