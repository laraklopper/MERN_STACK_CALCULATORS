// currencyFunc.js
import { currencyCountries } from "./currencyCountries";
import { NOT_AVAILABLE } from "./calculatorFunc";
// The converter's inputs before the user has filled anything in, and on reset
export const EMPTY_CONVERT_FORM = {
    amount: '',
    from: '',
    to: ''
};
/* Format an amount in a given currency. `currencyDisplay` is the caller's
choice because the two cases want different things: a conversion is between two
currencies and has to name which one a figure is in, while the tax and interest
calculators only ever work in rands and read better with the symbol. A record
missing its code still shows its figure rather than nothing. */
const formatMoney = (value, code, currencyDisplay) => {
  if (typeof value !== 'number' || isNaN(value)) return NOT_AVAILABLE
  if (!code) return value.toFixed(2)
  try {
    return value.toLocaleString('en-ZA', {
      style: 'currency',
      currency: code,
      currencyDisplay,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } catch (error) {
    // An unusable currency code should not cost the user the figure itself
    return `${code} ${value.toFixed(2)}`
  }
}

/* An amount in its own currency, named by its code, e.g. ZAR 1 500,00. Used by
the conversions list, where two different currencies sit side by side and a
bare symbol would not say which is which. */
export const toMoney = (value, code) => formatMoney(value, code, 'code')
/* Currencies offered until GET /api/currencies answers, and kept if it never
does. The local country data covers the same codes, so an unreachable API leaves
the converter working off a curated list rather than an empty dropdown. */
export const FALLBACK_CURRENCIES = currencyCountries.map(
    ({ code, name }) => ({ code, name, symbol: '' })
);

/* Label a currency in the converter's dropdowns, e.g. 'ZAR - South African
Rand'. A code the provider reports without a name is still offered, listed by
its code alone. */
export const currencyOptionLabel = (code, name) => (name ? `${code} - ${name}` : code)

/* Country lookup by currency code, built once from the static data rather than
searched through for every row. */
const COUNTRIES_BY_CODE = currencyCountries.reduce((lookup, { code, countries }) => {
    lookup[code] = countries;
    return lookup;
}, {});

/* The countries a currency is used in, as one string. This is not something the
currencies API reports, so it is looked up in the local currencyCountries data
and left as a dash for any code that data does not cover. */
export const countriesForCode = (code) =>
    COUNTRIES_BY_CODE[code] ? COUNTRIES_BY_CODE[code].join(', ') : '—'

/* Name lookup by currency code, built once from the static data, and the
fallback for a code the provider list does not carry a name for. */
export const NAMES_BY_CODE = currencyCountries.reduce((lookup, { code, name }) => {
    lookup[code] = name;
    return lookup;
}, {});

/* Format a figure as rands, e.g. R 1 500,00. Used by the tax and interest
calculator forms, which work only in rands. A missing figure is shown as R 0,00
rather than as nothing, because a result card with no number in it reads as a
fault rather than as a zero. */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 2,
    }).format(value || 0);
}