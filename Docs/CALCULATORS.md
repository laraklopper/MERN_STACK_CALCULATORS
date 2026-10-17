# APPLICATION CALCULATORS

# OVERVIEW

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

All Tax and Interest calculations are calculated in terms of South African Tax and Interest. 

## TABLE OF CONTENTS
1. [BASIC/GENERAL CALCULATOR](#1-basicgeneral-calculator)
2. [INTEREST CALCULATOR](#2-interest-calculator)
3. [TAX CALCULATOR](#3-income-tax-calculator)
4. [PROVISIONAL TAX CALCULATOR](#4-provisional-tax-calculator)
5. [CURRENCY CONVERTER](#5-currency-converter)

## 1. BASIC/GENERAL CALCULATOR 
## 2. INTEREST CALCULATOR
## 3. (INCOME) TAX CALCULATOR
## 4. PROVISIONAL TAX CALCULATOR
## 5. CURRENCY CONVERTER
## 6. CALCULATION HISTORY
## 7. REFERENCES

- https://www.npmjs.com/package/mathjs
- https://frankfurter.dev/
- https://mathjs.org/docs/expressions/parsing.html