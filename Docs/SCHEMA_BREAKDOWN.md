# SCHEMA BREAKDOWN

## TABLE OF CONTENTS


## 1. 

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
| `dateOfBirth` | Date | Yes | — | Must be a valid date in the past | All users must be 16 years or older and Admin Users must be 18 or older |
| `password` | String | Yes | — | 8–1024 chars, `select: false` | Hashed in registration middleware (not used during dev) |
| `admin` | Boolean | No | `false` | — | `true` = admin privileges; admins must be 21 or older |


## 3. INTEREST SCHEMA

## 4. TAX CALCULATION SCHEMA

## 5. PROVISIONAL TAX CALCULATION SCHEMA

## 5. VAT CALCULATION SCHEMA

## R