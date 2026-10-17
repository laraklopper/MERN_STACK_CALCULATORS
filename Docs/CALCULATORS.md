# CALCULATORS

## 1. OVERVIEW

The application provides users with these calculators:
- TaxCalculator
- ProvisionalTaxCalculator
- InterestCalculator
- General/basic calculator
- CurrencyConverter

<!-- Temporary API endpoint placeHolder -->

| Calculator | Component | Page | API endpoint |Saves to history |
|----------|------------|---------| ----------|----|
| Basic/general calculator | [BasicCalculator](../client/src/components/BasicCalculator.js) | [Calculators.js](../client/src/pages/Calculators.js)|None (worked out in the browser) | No |
|InterestCalculator| [InterestCalculator](../client/src/components/) |  [Calculators.js](../client/src/pages/Calculators.js)| `POST /api/interest/calculate`| Yes|
| Income tax | [IncomeTaxC] | [Tax.js](../client/src/pages/Tax.js) | `POST /api/tax/calculate` | Yes |
| Provisional tax (IRP6) | |[Tax.js](../client/src/pages/Tax.js)| `POST /provisional/calculate`  |Yes|
| Currency converter | [CurrencyConvertForm.js](../client/src/components/CurrencyConvertForm.js) | [Converter.js](../client/src/pages/Converter.js)|`GET /api/convert`  |Yes|

