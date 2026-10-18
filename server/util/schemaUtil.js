// schemaUtil.js

/*===============================
VAT SCHEMA UTILITY
=============== */
// The standard rate SARS levies VAT at, as a decimal
export const SARS_VAT_RATE = 0.15;

/* The two directions a VAT calculation can run in. Exported so the route's
validation and the schema's enum cannot drift apart from the maths. */
export const VAT_MODES = ['exclusive', 'inclusive'];