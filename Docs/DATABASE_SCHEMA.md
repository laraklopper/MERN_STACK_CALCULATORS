## DATABASE SCHEMAS

## TABLE OF CONTENTS
1. [OVERVIEW](#1-overview)
2. [OPTIONS](#2-options)
    - [2.1. GENERAL FIELD OPTIONS](#21-general-field-options)
    - [2.2. INDEX OPTIONS](#22-index-options)
3. [DATA TYPES](#3-data-types)
    - [3.1. SCHEMA TYPE OPTIONS](#31-schema-type-options)
        - [3.1.1. ALL SCHEMA TYPES](#311-all-schema-types)
        - [3.1.2. STRING](#312-string)
        - [3.1.3. NUMBER](#313-number)
        - [3.1.4. DATE](#314-date)
        - [3.1.5. OBJECTID](#315-objectid)
        - [3.1.6. ARRAY, MAP, AND OTHER SPECIALISED OPTIONS](#316-array-map-and-other-specialised-options)
4. [SCHEMA OPTIONS](#4-schema-options)
5. [REFERENCES](#5-references)

## 1. OVERVIEW
The application uses `mongoose` middleware to create schemas/models for each user collection.
Each schema maps to a MongoDB collection and defines the shape of the documents within that collection.

```js
import mongoose from 'mongoose';
const schema = new mongoose.Schema({ 
    // id: {},//Primary Key added to each document in the database by default
    fieldOne: {type:String,},
    fieldTwo: {type: Number}
    /* ... */ }, /*second arguement*/);

module.exports = mongoose.model('collection', schema);
```
## 2. OPTIONS



```js
new Schema({ /* ... */ }, options);

// or

const schema = new Schema({ /* ... */ });
schema.set(option, value);
```
### 2.1. GENERAL FIELD OPTIONS

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

### 2.2. INDEX OPTIONS

These configure database indexes on a field. *`unique` creates a unique index; it is not a Mongoose validator.*

| Option | Purpose | Example |
|---|---|---|
| `index` | Defines an index, optionally with index settings | `index: true` |
| `unique` | Defines a unique index | `unique: true` |
| `sparse` | Defines an index that skips missing fields | `sparse: true` |
| `text` | Defines a text index | `text: true` |

## 3. DATA TYPES

The `type` is a special property in `Mongoose` schemas. It specifies the data type required in that field.

| TYPE | DESCRIPTION |
|-----|-----|
|Ids| Primary Key added to each document by default|
| String | Text values. |
| Number | Numeric values (integers or floats).. |
| Date | Date and time values. Values are cast to JavaScript `Date` objects. |
| Buffer | Binary data, such as images or files. |
| Boolean | `true` or `false` values.( Mongoose also casts values like `'true'`, `1`, `'false'` and `0`.) |
| Mixed | Any value type (`Schema.Types.Mixed` or `{}`). Mongoose does not track changes automatically, so call `markModified()` after changing it. |
| ObjectId | A unique MongoDB *document* identifier (`Schema.Types.ObjectId`). Usually used with `ref` to reference documents in other collections. |
| Array | A list of values of a single SchemaType or of subdocuments, e.g. `[String]` or `[childSchema]`. |
| Decimal128 | High-precision 128-bit decimal numbers. These are useful for financial values where floating-point rounding errors must be avoided. |
| Map | Key-value pairs with string keys and values of a specified type, e.g. `{ type: Map, of: String }`. |
| Schema | A nested schema that creates a single subdocument with its own fields and validation. |
| UUID | Universally unique identifiers, stored as MongoDB binary UUIDs. |
| BigInt | Integers too large for the JavaScript `Number` type, stored as 64-bit integers. |
| Double | 64-bit floating-point numbers, always stored as BSON doubles (even whole numbers). |
| Int32 | 32-bit integers, stored as BSON int32. Non-integer values are rejected. |

### 3.1. SCHEMA TYPE OPTIONS
#### 3.1.1. ALL SCHEMA TYPES


Options used in all schema `types`
| OPTION |  DESCRIPTION|
|----|----|
|required | boolean or function: if true adds a required validator for this property|
|default | Any or function : sets a default value for the path. If the value is a function, the return value of the function is used as the default.|
|select| boolean : specifies default projections for queries |
|validate| function : adds a validator function for this property |
|get | function : defines a custom getter for this property using Object.defineProperty().
|set | function : defines a custom setter for this property using Object.defineProperty().
|alias | string , (mongoose >= 4.10.0 only.):  Defines a virtual with the given name that gets/sets this path.|
|immutable | boolean :defines path as immutable. Mongoose prevents you from changing immutable paths unless the parent document has isNew: true.|
|transform| function : Mongoose calls this function when you call Document#toJSON() function, including when you `JSON.stringify()` a document |
<!-- TYPE SPECIFIC -->

#### 3.1.2. STRING
| OPTION |  DESCRIPTION|
|----|----|
|lowercase | boolean : whether to always call .toLowerCase() on the value |
|uppercase: |boolean:  whether to always call .toUpperCase() on the value|
|trim: |boolean : indictes whether to always call .trim() on the value|
|match |RegExp : creates a validator that checks if the value matches the given regular expression|
|enum: |Array : creates a validator that checks if the value is in the given array.|
|minLength | Number :creates a validator that checks if the value length is not less than the given number|
|maxLength: |Number : creates a validator that checks if the value length is not greater than the given number|
|populate: |Object : sets default populate options|

#### 3.1.3. NUMBER
| OPTION |  DESCRIPTION|
|----|----|
|min:| Number: creates a validator that checks if the value is greater than or equal to the given minimum.|
|max: |Number:  creates a validator that checks if the value is less than or equal to the given maximum.|
|enum: | Array:  creates a validator that checks if the value is strictly equal to one of the values in the given array.|
|populate:| Object: sets default populate options |

#### 3.1.4. DATE
| OPTION |  DESCRIPTION|
|----|----|
|min: |Date, creates a validator that checks if the value is greater than or equal to the given minimum.
|max: |Date, creates a validator that checks if the value is less than or equal to the given maximum.
|expires: | Number or String, creates a TTL index with the value expressed in seconds.

#### 3.1.5. OBJECTID

| OPTION |  DESCRIPTION|
|----|----|
|populate | Object: sets default populate options |

#### 3.1.6. ARRAY, MAP, AND OTHER SPECIALISED OPTIONS

| Type | Option | Purpose | Example |
|---|---|---|---|
| Array | `of` | Specifies element type | `{ type: Array, of: String }` |
| Array | `castNonArrays` | Controls conversion of non-arrays into arrays | `castNonArrays: false` |
| String array | `enum` | Restricts allowed element values | `enum: ['red', 'blue']` |
| Map | `of` | Specifies map value type | `{ type: Map, of: Number }` |
| Union | `of` | Specifies alternative field types | `{ type: Schema.Types.Union, of: [String, Number] }` |
| ObjectId | `populate` | Default populate settings | `populate: { select: 'username' }` |

## 4. SCHEMA OPTIONS

Schemas have a few configurable options which can be passed in the second argument to new Schema().
```js
new Schema({ /* ... */ }, options);

// or

const schema = new Schema({ /* ... */ });
schema.set(option, value);

```

| Option | Purpose |
|---|---|
| `timestamps` | Adds/manages creation and update dates |
| `collection` | Sets collection name |
| `strict` | Controls unknown document fields |
| `strictQuery` | Controls unknown query filter fields |
| `versionKey` | Configures/disables `__v` |
| `optimisticConcurrency` | Detects conflicting saves |
| `skipVersioning` | Excludes paths from versioning |
| `_id` | Controls automatic subdocument IDs |
| `id` | Controls the string `id` virtual |
| `minimize` | Controls removal of empty objects |
| `toJSON` | Configures JSON serialization |
| `toObject` | Configures plain-object conversion |
| `typeKey` | Replaces the special `type` key |
| `validateBeforeSave` | Controls automatic save validation |
| `autoIndex` | Controls automatic index creation |
| `autoCreate` | Controls automatic collection creation |
| `autoSearchIndex` | Controls automatic search-index creation |
| `excludeIndexes` | Excludes indexes from an embedded schema |
| `bufferCommands` | Controls buffering while disconnected |
| `bufferTimeoutMS` | Sets buffering timeout |
| `capped` | Configures a capped collection |
| `collation` | Sets default collation |
| `read` | Sets read preference |
| `readConcern` | Sets read consistency |
| `writeConcern` | Sets write acknowledgement |
| `shardKey` | Specifies the shard key |
| `discriminatorKey` | Sets the discriminator field |
| `selectPopulatedPaths` | Controls automatic population-field selection |
| `storeSubdocValidationError` | Controls parent-level subdocument errors |
| `timeseries` | Configures a time-series collection |
| `collectionOptions` | Supplies collection-creation settings |
| `methods` | Defines document methods |
| `statics` | Defines model methods |
| `query` | Defines query helpers |
| `virtuals` | Defines computed properties |

## 5. REFERENCES


- https://mongoosejs.com/docs/guide.html
- https://mongoosejs.com/docs/schematypes.html