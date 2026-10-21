# SCHEMA BREAKDOWN

## TABLE OF CONTENTS
1. [SCHEMAS]
2. [USER SCHEMA]
3. 
## 1. SCHEMAS

The application uses `mongoose` middleware to create schemas/models for each user collection.

Each schema maps to a MongoDB collection and defines the shape of the documents within that collection.

### 1.1. GENERAL FIELD OPTIONS
These go inside a field definition, such as name: { type: String, required: true }.

| Option | Purpose | Example |
|---|---|---|
| `type` | Sets the field’s data type | `type: String` |
| `required` | Adds required validation; can be conditional | `required: true` |
| `default` | Supplies a default value or function | `default: Date.now` |
| `validate` | Defines custom validation | `validate: v => v >= 0` |
| `allowNull` | Controls whether `null` is allowed | `allowNull: false` |
| `select` | Includes/excludes the field by default in queries | `select: false` |
| `get` | Transforms a value when accessed | `get: v => Math.round(v)` |
| `set` | Transforms an assigned value | `set: v => Math.round(v)` |
| `alias` | Adds another property name for the same field | `alias: 'displayName'` |
| `immutable` | Prevents changes after the initial save | `immutable: true` |
| `cast` | Customizes casting or cast errors | `cast: '{VALUE} is invalid'` |
| `transform` | Transforms the field during serialization | `transform: v => v?.toString()` |
| `ref` | Identifies the model used by `populate()` | `ref: 'User'` |
| `refPath` | Identifies the field containing the model name | `refPath: 'ownerModel'` |
### 1.3. SCHEMA TYPES

The `type` is a special property in Mongoose schemas. When Mongoose finds a nested property named type in your schema, Mongoose assumes that it needs to define a SchemaType with the given type.

| TYPE | DESCRIPTION |
|-----|-----|
| String | Text values. Supports options like `trim`, `lowercase`, `uppercase`, `minLength`, `maxLength`, `match` (regex) and `enum`. |
| Number | Numeric values (integers or floats). Supports `min` and `max` validators. |
| Date | Date and time values. Values are cast to JavaScript `Date` objects, and `min`/`max` validators are supported. |
| Buffer | Binary data, such as images or files. |
| Boolean | `true` or `false` values. Mongoose also casts values like `'true'`, `1`, `'false'` and `0`. |
| Mixed | Any value type (`Schema.Types.Mixed` or `{}`). Mongoose does not track changes automatically, so call `markModified()` after changing it. |
| ObjectId | A unique MongoDB document identifier (`Schema.Types.ObjectId`). Usually used with `ref` to reference documents in other collections. |
| Array | A list of values of a single SchemaType or of subdocuments, e.g. `[String]` or `[childSchema]`. |
| Decimal128 | High-precision 128-bit decimal numbers. Useful for financial values where floating-point rounding errors must be avoided. |
| Map | Key-value pairs with string keys and values of a specified type, e.g. `{ type: Map, of: String }`. |
| Schema | A nested schema that creates a single subdocument with its own fields and validation. |
| UUID | Universally unique identifiers, stored as MongoDB binary UUIDs. |
| BigInt | Integers too large for the JavaScript `Number` type, stored as 64-bit integers. |
| Double | 64-bit floating-point numbers, always stored as BSON doubles (even whole numbers). |
| Int32 | 32-bit integers, stored as BSON int32. Non-integer values are rejected. |
### 1.2. INDEX OPTIONS


| Option | Purpose | Example |
|---|---|---|
| `index` | Defines an index, optionally with index settings | `index: true` |
| `unique` | Defines a unique index | `unique: true` |
| `sparse` | Defines an index that skips missing fields | `sparse: true` |
| `text` | Defines a text index | `text: true` |
## 2. USER SCHEMA

### 2.1. PURPOSE
<!-- EXPLAIN THE PURPOSE OF THE  -->

### 2.2 FIELDS

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `fullName.firstName` | String | Yes | — | trim, 2–50 chars | |
| `fullName.lastName` | String | Yes | — | trim, 2–50 chars | |
| `username` | String | Yes | — | unique, trim, 2–50 chars | Login identifier |
| `contactDetails.email` | String | Yes | — | unique, trim, lowercase, regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` | Any country allowed |
| `contactDetails.contactNumber` | String | Yes | — | unique, trim, regex `^(\+27\|0)\d{2}[ ]?\d{3}[ ]?\d{4}$` | South African format, e.g. `082 123 4567` or `+27 82 123 4567` |
| `dateOfBirth` | Date | Yes | — | Must be a valid date in the past | All users must be 16 years or older and Admin Users must be 21 or older |
| `password` | String | Yes | — | 8–1024 chars, `select: false` | Hashed in registration middleware (not used during dev) |
| `admin` | Boolean | No | `false` | — | `true` = admin privileges; admins must be 21 or older |


`timestamps: true` adds `createdAt` and `updatedAt` (Date) automatically.

## 3. INTEREST SCHEMA


### 3.1 FIELDS

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `user` | ObjectId | Yes | — | ref `user`, indexed | Owner of the saved calculation |
| `username` | String | Yes | — | trim, 2–50 chars | Current logged-in user's username |
| `principal` | Number | Yes | — | min 0 | Amount the interest is calculated on |
| `interestRate` | Number | Yes | — | min 0 | Annual interest rate (percentage) |
| `time.duration` | Number | Yes | — | min 0 | Length of the investment/loan |
| `time.unit` | String | No | `'years'` | enum `years`, `months` | Unit the duration is measured in |
| `interestType` | String | No | `'simple'` | enum `simple`, `compound` | |
| `compoundFrequency` | Number | No | `1` | min 1 | Times compounded per year (compound only) |
| `monthlyContribution` | Number | No | `0` | min 0 | Optional recurring contribution |
| `totalInterest` | Number | Yes | — | min 0 | Calculated: total interest earned |
| `totalContributions` | Number | No | `0` | min 0 | Calculated: sum of monthly contributions |
| `finalAmount` | Number | Yes | — | min 0 | Calculated: principal + contributions + interest |

### 3.2 VIRTUALS

| Virtual | Returns |
|---|---|
| `durationInYears` | `time.duration` converted to years |
| `totalCapital` | `principal + totalContributions` |

## 4. TAX CALCULATION SCHEMA

### 4.1 FIELDS

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `user` | ObjectId | Yes | — | ref `user`, indexed | Owner of the saved calculation |
| `username` | String | Yes | — | trim, 2–50 chars | Current logged-in user's username |
| `taxYear` | String | Yes | — | trim | e.g. `"2025-2026"` |
| `incomeType` | String | Yes | — | enum `annual`, `monthly` | Whether the income entered is annual or monthly |
| `income` | Number | Yes | — | min 0 | Income as entered by the user |
| `age` | Number | Yes | — | min 0 | Decides the rebates and threshold |
| `dependants` | Number | No | `0` | min 0 | Medical aid dependants. Recorded for reference only |
| `annualIncome` | Number | Yes | — | min 0 | Calculated: annualised income |
| `grossTax` | Number | Yes | — | min 0 | Calculated: tax before rebates |
| `rebate` | Number | Yes | — | min 0 | Calculated: rebate deducted from gross tax |
| `netTax` | Number | Yes | — | min 0 | Calculated: tax payable after rebates |
| `effectiveRate` | Number | Yes | — | min 0 | Calculated: net tax as % of annual income |
| `marginalRate` | Number | Yes | — | min 0 | Calculated: rate on the top rand of income (%) |
| `bracketBreakdown` | [bracketBreakdown] | No | `[]` | — | Array of subdocuments (see 4.2) |

### 4.2 BRACKET BREAKDOWN SUBDOCUMENT

No `_id` field.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `min` | Number | Yes | — | Lower bound of the bracket (R) |
| `max` | Number | No | `null` | Upper bound (R). `null` = no ceiling |
| `rate` | Number | Yes | — | Marginal rate, e.g. `0.18` for 18% |
| `amountInBracket` | Number | Yes | — | Income that fell into the bracket |
| `taxForBracket` | Number | Yes | — | Tax on that slice of income |

### 4.3 VIRTUALS

| Virtual | Returns |
|---|---|
| `monthlyNetTax` | `netTax / 12`, rounded to 2 decimals |

## 5. PROVISIONAL TAX CALCULATION SCHEMA

### 5.1 FIELDS

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `user` | ObjectId | Yes | — | ref `user`, indexed | Owner of the saved calculation |
| `username` | String | Yes | — | trim, 2–50 chars | Current logged-in user's username |
| `taxYear` | String | Yes | — | trim, regex `^\d{4}-\d{4}$` | Format `YYYY-YYYY` |
| `period` | String | Yes | — | enum `first`, `second`, `third` | IRP6 payment. The third is a voluntary top-up |
| `estimatedTaxableIncome` | Number | Yes | — | min 0 | Estimate for the whole year of assessment |
| `age` | Number | Yes | — | min 0 | Decides the rebates and threshold |
| `basicAmount` | Number | No | `null` | min 0 | Last assessed taxable income. `null` = not supplied (not the same as nil) |
| `employeesTax` | Number | No | `0` | min 0 | |
| `foreignTaxCredits` | Number | No | `0` | min 0 | |
| `medicalCredits` | Number | No | `0` | min 0 | Medical scheme fees tax credits |
| `priorPayments` | Number | No | `0` | min 0 | Provisional tax already paid |
| `portion` | Number | Yes | — | min 0, max 1 | Calculated: share of the year's liability, e.g. `0.5` |
| `dueDate` | Date | No | `null` | — | Calculated: IRP6 due date |
| `grossTax` | Number | No | `0` | min 0 | Calculated |
| `rebate` | Number | No | `0` | min 0 | Calculated |
| `medicalCreditsApplied` | Number | No | `0` | min 0 | Calculated |
| `annualTaxLiability` | Number | No | `0` | min 0 | Calculated |
| `taxForPeriod` | Number | No | `0` | min 0 | Calculated |
| `totalCredits` | Number | No | `0` | min 0 | Calculated |
| `amountPayable` | Number | No | `0` | min 0 | Calculated |
| `overpaid` | Number | No | `0` | min 0 | Calculated |
| `effectiveRate` | Number | No | `0` | min 0 | Calculated |
| `marginalRate` | Number | No | `0` | min 0 | Calculated |
| `breakdown` | [provBreakdown] | No | `[]` | — | Array of subdocuments (see 5.2) |
| `warnings` | [String] | No | `[]` | — | Warnings shown with the result |

### 5.2 BREAKDOWN SUBDOCUMENT

No `_id` field.

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `label` | String | Yes | — | — | What the row is, e.g. `"Less: rebates"` |
| `amount` | Number | Yes | — | — | Rand figure for the row |
| `type` | String | Yes | — | enum `line`, `deduct`, `subtotal`, `total` | How the row is displayed |

## 6. VAT CALCULATION SCHEMA

### 6.1 FIELDS

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `user` | ObjectId | Yes | — | ref `user`, indexed | Owner of the saved calculation |
| `username` | String | Yes | — | trim, 2–50 chars | Current logged-in user's username |
| `mode` | String | Yes | — | enum `exclusive`, `inclusive` | `exclusive` = VAT added on top; `inclusive` = VAT stripped out |
| `isZeroRated` | Boolean | No | `false` | — | Item is zero-rated (0%) |
| `ratePercent` | Number | Yes | — | min 0, max 100 | Rate used: SARS standard rate or 0 |
| `netAmount` | Number | Yes | — | min 0 | Calculated: amount excluding VAT |
| `vatAmount` | Number | Yes | — | min 0 | Calculated: VAT portion |
| `grossAmount` | Number | Yes | — | min 0 | Calculated: amount including VAT |

### 6.2 VIRTUALS

| Virtual | Returns |
|---|---|
| `enteredAmount` | `grossAmount` if `mode` is `inclusive`, otherwise `netAmount` |
| `effectiveRate` | `vatAmount / netAmount * 100`, or `0` when `netAmount` is 0 |

## 7. CURRENCY CONVERTER SCHEMA

### 7.1 FIELDS

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `user` | ObjectId | Yes | — | ref `user`, indexed | Owner of the saved conversion |
| `username` | String | Yes | — | trim, 2–50 chars | Current logged-in user's username |
| `currency.baseCurrency` | String | Yes | — | trim, uppercase, regex `^[A-Z]{3}$` | 3-letter currency code, e.g. `ZAR` |
| `currency.targetCurrency` | String | Yes | — | trim, uppercase, regex `^[A-Z]{3}$` | 3-letter currency code, e.g. `USD` |
| `amount` | Number | Yes | — | min 0 | Amount in the base currency |
| `rate` | Number | Yes | — | min 0 | Exchange rate (target per base) |

### 7.2 VIRTUALS

| Virtual | Returns |
|---|---|
| `convertedAmount` | `amount * rate` |

## 8. TAX YEAR CONFIG SCHEMA

### 8.1 FIELDS

Does not use the `timestamps` option. `createdAt` is defined manually and there is no `updatedAt`.

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `taxYear` | String | Yes | — | unique | e.g. `"2025-2026"` |
| `startDate` | Date | Yes | — | — | 1 March |
| `endDate` | Date | Yes | — | — | 28/29 February |
| `brackets` | [Bracket] | Yes | — | — | Array of subdocuments (see 8.2) |
| `rebates` | Rebate | Yes | — | — | Subdocument (see 8.3) |
| `thresholds` | Threshold | Yes | — | — | Subdocument (see 8.4) |
| `isActive` | Boolean | No | `true` | — | Current tax year flag |
| `createdAt` | Date | No | `Date.now` | — | |

### 8.2 BRACKET SUBDOCUMENT

No `_id` field.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `min` | Number | Yes | — | Lower bound of the bracket (R) |
| `max` | Number | No | `null` | Upper bound (R). `null` = no ceiling |
| `baseAmount` | Number | Yes | — | Fixed amount owed at the bracket start |
| `rate` | Number | Yes | — | Marginal rate, e.g. `0.18` for 18% |

### 8.3 REBATE SUBDOCUMENT

No `_id` field.

| Field | Type | Required | Notes |
|---|---|---|---|
| `primary` | Number | Yes | All taxpayers |
| `secondary` | Number | Yes | Age 65+ |
| `tertiary` | Number | Yes | Age 75+ |

### 8.4 THRESHOLD SUBDOCUMENT

No `_id` field.

| Field | Type | Required | Notes |
|---|---|---|---|
| `under65` | Number | Yes | Tax threshold under age 65 |
| `age65to74` | Number | Yes | Tax threshold for ages 65–74 |
| `age75plus` | Number | Yes | Tax threshold for age 75+ |

## REFERENCES

- https://mongoosejs.com/docs/guide.html
- https://mongoosejs.com/docs/schematypes.html