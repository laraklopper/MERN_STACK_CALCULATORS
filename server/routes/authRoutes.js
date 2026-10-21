//authRoutes.js
/*auth endpoints : mounted at /users by app.js
POST: /login - submit user login
POST: /register - submit registration to add a new user
PATCH: /setAdmin - upgrade user to admin (21+ and user for 1 day during development)
PATCH: /clearAdmin - remove admin status from the user
All passwords are saved in Plaintext for development,
auth/login auth/register routes do not require a <Bearer> header for user authorization/
*/
/* Load environment variables from a .env
file using the dotenv package*/
require('dotenv').config()
// Import Required modules and packages
const express = require('express');
const jwt = require('jsonwebtoken');// Import the JSON Web Token (JWT) library used to sign tokens
const User = require('../models/userSchema');
const { checkJwtToken, checkPassword, checkAge } = require('../middleware/middleware');
const router = express.Router()

// Extract environmental variables (with safe fallbacks for local dev)
const rawSecretKey = process.env.JWT_SECRET_KEY;// JWT secret key
const rawExpiration = process.env.JWT_EXPIRATION;// JWT expiration time
const rawAlgorithm = process.env.JWT_ALGORITHM;// JWT algorithm
const secretKey = rawSecretKey || 'secretKey';// Fallback secret key
const expirationTime = rawExpiration || '12h';// Fallback expiration time
const jwtAlgorithm = rawAlgorithm || 'HS256';// Fallback JWT algorithm

//=====CHECK IF ALL THE ENVIRONMENTAL VARIABLES A PRESENT=========
// Conditional rendering to check if the environmental variables are missing
if (!rawSecretKey) {
    console.warn("[WARNING: userRoute.js]: JWT_SECRET_KEY not set. Using fallback key.");// Log a warning message in the console for debugging purposes
}
// Conditional rendering to check if the environmental variables are missing
else if (!rawExpiration) {
    console.warn('[WARNING: userRoute.js] Missing exiration time, using fallback time')// Log a warning message in the console for debugging purposes
}
// Conditional rendering to check if the environmental variables are missing
else if (!rawAlgorithm) {
    console.warn('[WARNING: userRoute.js] Missing jwt algorithm, using fallback algorithm.'); // Log a warning message in the console for debugging purposes
}
//=============ROUTES================
// Use Plaintext passwords for development
/*──────────────────────────── HELPERS ──────────────────────────────*/
// Sign a JWT for the given user document
const signToken = (user) => {
    return jwt.sign(
        { userId: user._id, email: user.contactDetails?.email, admin: user.admin },
        secretKey,
        { expiresIn: expirationTime, algorithm: jwtAlgorithm }
    );
}
/*──────────────────────────── POST ROUTES ──────────────────────────────
    POST: Used to create a new resource/submit data to the database
 ─────────────────────────────────────────────────────────────────────────*/
//Route for userLogin
// Send a POST request to the /auth/login route
router.post('/login', async (req, res) => {
  try {
    const {username, password} = req.body || {}
    console.log(`[REQUEST BODY: authRoutes.js, /login ]: ${req.body}`)

    if (!username || !password) {
         console.error('[ERROR: authRoutes.js, /login] username and password are required');
        return res.status(400).json({ message: 'email and password are required' })
    }
    if (typeof username !== 'string' || typeof password !== 'string') {
        console.error('[ERROR: authRoutes.js, /login] username and password must be strings');
        return res.status(400).json({ message: 'username and password are required' });
    }
    const user = await User.findOne({username})
        .select('+password')
        .exec()
      // Use Plaintext passwords for development - compare directly, no hashing
        if (!user || user.password !== password) {
            console.error('[ERROR: authRoutes.js, /login] Invalid email or password');
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = signToken(user);
        const userObj = user.toObject();
        delete userObj.password;// Never send the password back to the client

        console.log('[SUCCESS: authRoutes.js, /login] User logged in:', user.username);
        return res.status(200).json({ message: 'Login successful', token, user: userObj });

  } catch (error) {
    console.error('[ERROR: authRoutes.js, /login]', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
  }  
})
//Route to register a new user
//Send a POST request to the auth/register endpoint
router.post('/register', checkPassword, checkAge, async (req, res) => {
    try {
        const { username, fullName, contactDetails, password, dateOfBirth } = req.body || {};
        const { firstName, lastName } = fullName || {};// Nested full name
        const { email, contactNumber } = contactDetails || {};// Nested contact details

        console.log('[REQUEST BODY: authRoutes.js, /register]:', { username, fullName, contactDetails, dateOfBirth });// Never log the password

        if (!username || !firstName || !lastName || !email || !contactNumber || !password || !dateOfBirth) {
            console.error('[ERROR: authRoutes.js, /register] Missing required registration fields');
            return res.status(400).json({
                message: 'username, first name, last name, email, contact number, password and dateOfBirth are required'
            });
        }
        // Conditional rendering to check that the text fields are strings (blocks query injection objects)
        if ([username, firstName, lastName, email, contactNumber].some((v) => typeof v !== 'string')) {
            console.error('[ERROR: authRoutes.js, /register] Text fields must be strings');
            return res.status(400).json({ message: 'username, full name and contact details must be strings' });
        }

        // Check if the username is already taken
        const existingUsername = await User.findOne({ username: username.trim() });
        if (existingUsername) {
            console.error('[ERROR: authRoutes.js, /register] Username already taken:', username);
            return res.status(409).json({ message: 'Username is already taken' });
        }
        // Check if the email is already registered
        const existingEmail = await User.findOne({ 'contactDetails.email': email.toLowerCase().trim() });
        if (existingEmail) {
            console.error('[ERROR: authRoutes.js, /register] Email already registered:', email);
            return res.status(409).json({ message: 'Email is already registered' });
        }
        // Check if the contact number is already registered
        const existingNumber = await User.findOne({ 'contactDetails.contactNumber': contactNumber.trim() });
        if (existingNumber) {
            console.error('[ERROR: authRoutes.js, /register] Contact number already registered:', contactNumber);
            return res.status(409).json({ message: 'Contact number is already registered' });
        }

        // Use Plaintext passwords for development - stored as-is, no hashing
        // New users are always regular users; admin status is requested later (AdminRegisForm.js)
        const newUser = await User.create({
            username,
            fullName: { firstName, lastName },
            contactDetails: { email, contactNumber },
            dateOfBirth,
            password,
            admin: false,
        });

        const token = signToken(newUser);
        const userObj = newUser.toObject();
        delete userObj.password;// Never send the password back to the client

        console.log('[SUCCESS: authRoutes.js, /register] User registered:', newUser.username);
        return res.status(201).json({ message: 'Registration successful', token, user: userObj });

    } catch (error) {
        // Mongoose validation errors (required fields, min/max length, etc.)
        if (error.name === 'ValidationError') {
            // Send back only the first readable validation message
            const message = Object.values(error.errors || {})[0]?.message || error.message;
            console.error('[ERROR: authRoutes.js, /register] Validation error:', error.message);
            return res.status(400).json({ message });
        }
        // Duplicate key error (unique username/email/contact number constraint)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || '';// Which unique field clashed
            console.error(`[ERROR: authRoutes.js, /register] Duplicate ${field}`);
            const messages = {
                'username': 'Username is already taken',
                'contactDetails.email': 'Email is already registered',
                'contactDetails.contactNumber': 'Contact number is already registered',
            };
            return res.status(409).json({ message: messages[field] || 'User already exists' });
        }
        console.error('[ERROR: authRoutes.js, /register]', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})
/*──────────────────────────── PATCH ROUTES ──────────────────────────────
    PATCH: Used to partially update an existing resource
 ─────────────────────────────────────────────────────────────────────────*/
// Admin requirements (AdminRegisForm.js)
const ADMIN_MIN_AGE = 21;// Admin users must be 21 or older
const ADMIN_MIN_ACCOUNT_AGE_MS = 24 * 60 * 60 * 1000;// User for 1 day during development (3 months in production)

// Calculate a user's age in years from their date of birth
const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    return now.getFullYear() - dob.getFullYear() - (
        now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0
    );
}
//Route to upgrade the logged in user to admin
//Send a PATCH request to the /auth/setAdmin endpoint
router.patch('/setAdmin', checkJwtToken, async (req, res) => {
    try {
        const user = await User.findById(req.user?.userId).exec();
        if (!user) {
            console.error('[ERROR: authRoutes.js, /setAdmin] User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.admin === true) {
            console.error('[ERROR: authRoutes.js, /setAdmin] User is already an admin:', user.username);
            return res.status(409).json({ message: 'User is already an admin' });
        }
        // Age restriction: admins must be 21 or older
        if (calculateAge(user.dateOfBirth) < ADMIN_MIN_AGE) {
            console.error('[ERROR: authRoutes.js, /setAdmin] User is under the admin age requirement:', user.username);
            return res.status(403).json({ message: `You must be at least ${ADMIN_MIN_AGE} years old to register as an admin.` });
        }
        // Users can only register as admin after a specific time as a user
        if (Date.now() - new Date(user.createdAt).getTime() < ADMIN_MIN_ACCOUNT_AGE_MS) {
            console.error('[ERROR: authRoutes.js, /setAdmin] Account is too new:', user.username);
            return res.status(403).json({ message: 'Your account is too new to register as an admin.' });
        }

        user.admin = true;
        await user.save();

        // Sign a new token so the admin claim is up to date
        const token = signToken(user);
        const userObj = user.toObject();
        delete userObj.password;// Never send the password back to the client

        console.log('[SUCCESS: authRoutes.js, /setAdmin] User registered as admin:', user.username);
        return res.status(200).json({ message: 'Admin registration successful', token, user: userObj });

    } catch (error) {
        console.error('[ERROR: authRoutes.js, /setAdmin]', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})
//Route to remove admin status from the logged in user
//Send a PATCH request to the /auth/clearAdmin endpoint
router.patch('/clearAdmin', checkJwtToken, async (req, res) => {
    try {
        const user = await User.findById(req.user?.userId).exec();
        if (!user) {
            console.error('[ERROR: authRoutes.js, /clearAdmin] User not found');
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.admin !== true) {
            console.error('[ERROR: authRoutes.js, /clearAdmin] User is not an admin:', user.username);
            return res.status(409).json({ message: 'User is not an admin' });
        }

        user.admin = false;
        await user.save();

        // Sign a new token so the admin claim is up to date
        const token = signToken(user);
        const userObj = user.toObject();
        delete userObj.password;// Never send the password back to the client

        console.log('[SUCCESS: authRoutes.js, /clearAdmin] Admin status removed:', user.username);
        return res.status(200).json({ message: 'Admin status removed', token, user: userObj });

    } catch (error) {
        console.error('[ERROR: authRoutes.js, /clearAdmin]', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})
module.exports = router