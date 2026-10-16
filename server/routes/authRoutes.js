//authRoutes.js
/*
login
register
*/
require('dotenv').config()
const express = require('express');
const User = require('../models/userSchema')
const router = express.Router()
//=============ROUTES================
/*──────────────────────────── POST ROUTES ──────────────────────────────
    POST: Used to create a new resource/submit data to the database
 ─────────────────────────────────────────────────────────────────────────*/
//Route for userLogin
// Send a POST request to the /auth/login route

//Route to register a new user
//Send a POST request to the auth/register endpoint

module.exports = router