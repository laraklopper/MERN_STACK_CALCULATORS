// schemaUtil.js

/*===============================
VAT SCHEMA UTILITY
=============== */
// The standard rate SARS levies VAT at, as a decimal
const SARS_VAT_RATE = 0.15;

/* The two directions a VAT calculation can run in. Exported so the route's
validation and the schema's enum cannot drift apart from the maths. */
const VAT_MODES = ['exclusive', 'inclusive'];

/* The server is a CommonJS project ("type": "commonjs" in package.json), so
the values are exported with module.exports for require() to pick up. */
module.exports = { SARS_VAT_RATE, VAT_MODES };
