// app.js (server-side)
/* Load environment variables from a .env 
file using the dotenv package*/
require('dotenv').config(); // Load environment variables from a .env file
const express = require('express'); // Import the Express framework
const ensureJwtSecret = require('./config/ensureJwtSecret'); // Import the ensureJwtSecret function
ensureJwtSecret();// Ensure JWT secret is set and retrieve it
const cors = require('cors'); // Import the CORS middleware
const helmet = require('helmet'); // Import the Helmet middleware for security
const mongoose = require('mongoose'); // Import Mongoose for MongoDB interactions
const app = express(); // Create an Express application instance
const port = process.env.PORT || 3000; // Define the port to listen on, defaulting to 3000
const userRoutes = require('./routes/userRoutes')
const authRoutes = require('./routes/authRoutes')
const interestRoutes = require('./routes/interestRoutes')
const vatRoutes = require('./routes/vatRoutes')
const taxRoutes = require('./routes/taxRoutes')
const provTaxRoutes = require('./routes/provTaxRoutes')
const connectDB = require('./config/connect'); // Import the database connection function


//================SETUP MIDDLEWARE========================
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(cors()); // Use the CORS middleware
app.use(helmet()); // Use Helmet for security headers


//===============ROUTES========================
// Prefix all route modules with their base path.

app.use('/users', userRoutes);//User Routes: /me , fetchUsers,
app.use('/auth', authRoutes)//auth Routes: /login, /register
app.use('/interest', interestRoutes)// interest Routes:
app.use('/vat', vatRoutes)//vat routes:
app.use('/tax', taxRoutes)//income tax routes: /calculate, /save
app.use('/provisional', provTaxRoutes)//provisional tax routes: /calculate, /save
// ================== MONGOOSE CONFIG ==================
// Disable strict populate to prevent errors
// when populating paths that are conditionally defined
mongoose.set('strictPopulate', false)
mongoose.set('strictQuery', true); // Set Mongoose to use strict query mode

//==============START THE SERVER========================
connectDB().then(() => {
    app.listen(port, () => {
        console.info(`[INFO:app.js] server is running on ${port}`)// Log a message in the console indicating the server is running
    })
}).catch((error) => {
    console.error('[ERROR: app.js]: Database connection failed');// Log an error message in the console for debugging purposes
    process.exit(1);//Exit if connection failed
})