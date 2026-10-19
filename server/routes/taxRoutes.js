// taxRoutes.js
/* Income tax endpoints, mounted at /api/tax by app.js.

  GET    /config      - tax years the calculator can work with
  POST   /config      - create or update a tax year configuration (admin only)
  POST   /calculate   - work out the tax payable (returns a result, saves nothing)
  POST   /save        - save a calculation to the logged in user's history
  GET    /history     - the logged in user's saved calculations
  DELETE /history/:id - remove one of the logged in user's saved calculations

/save deliberately RECALCULATES from the user's inputs instead of storing the
figures the browser sends. A saved record is therefore always internally
consistent, and a tampered request cannot write false totals to the database.

The history routes scope every query by the user id on the JWT, never by an id
taken from the request, so a user can only ever read or delete their own
records. */
const express = require('express');
const router = express.Router()
const User = require('../models/userSchema');
const TaxCalc = require('../models/taxCalcSchema');

module.exports = router