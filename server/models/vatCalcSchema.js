// vatCalcSchema.js
/* A saved VAT calculation - one item as the calculator worked it out.

VAT is the simplest of the four calculators to store, because there is nothing
to resolve: no tax year, no brackets, no rebates and no age. What a record has
to carry is which DIRECTION the calculation ran in (VAT added to a
VAT-exclusive price, or stripped back out of a VAT-inclusive one) and the rate
it was worked out at, because those two facts are what make the three amounts
reconcile.

`ratePercent` is stored rather than read from utils/vatCalculator.js on the way
out. The rate is published by SARS and does change - it went from 14% to 15% in
2018, and a rise to 15.5% was tabled and withdrawn for 2025/2026 - so a record
that took the rate from the current constant would silently restate an old
calculation at today's rate. Stored, an old record still reproduces exactly what
the calculator showed.

The figures come from utils/vatCalculator.js, which the /save route re-runs on
the user's inputs rather than trusting the totals the browser sends. */
