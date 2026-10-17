# CALCULATORS

## 1. OVERVIEW

The application provides users with these calculators:
- TaxCalculator
- ProvisionalTaxCalculator
- InterestCalculator
- General/basic calculator
- CurrencyConverter

<!-- Temporary API endpoint placeHolder -->

| Calculator | Component | Page | API endpoint | Saves to history |
|------------|-----------|------|--------------|------------------|
| Basic/general calculator | [BasicCalculator.js](../client/src/components/BasicCalculator.js) (with [ButtonGrid.js](../client/src/components/ButtonGrid.js)) | [Calculators.js](../client/src/pages/Calculators.js) | None (worked out in the browser) | No |
| Interest calculator | InterestCalculator.js (not created yet) | [Calculators.js](../client/src/pages/Calculators.js) | `POST /api/interest/calculate` | Yes |
| Income tax | [IncomeTaxClaculator.js](../client/src/components/IncomeTaxClaculator.js) | [Tax.js](../client/src/pages/Tax.js) | `POST /api/tax/calculate` | Yes |
| Provisional tax (IRP6) | [ProvisionalTaxCalculator.js](../client/src/components/ProvisionalTaxCalculator.js) | [Tax.js](../client/src/pages/Tax.js) | `POST /api/provisional/calculate` | Yes |
| Currency converter | [CurrencyConverterForm.js](../client/src/components/CurrencyConverterForm.js) | [Converter.js](../client/src/pages/Converter.js) | `GET /api/convert` | Yes |

