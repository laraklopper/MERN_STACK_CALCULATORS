const mongoose = require('mongoose');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
     // Field for username(required for login)
    username: {
        type: String,//Indicate data type as a string
        trim: true,// Removes spaces before and after the username.
        required: [true, 'username is required'],//Mark the username as required
        unique: true,     // Enforce uniqueness at the DB level — prevents two accounts sharing the same login handle
        minlength: [2, 'Username must be at least 2 characters long'], // Minimum username length.
        maxlength: [50, 'Username cannot exceed 50 characters'],// Maximum username length.
    },
    // Field for user email (allow email address for any country)
    email: {
        type: String,//Indicate the data type as a String
        required: [true, 'Email is required'],//Mark the email as required
        unique: true,// Enforce uniqueness at the DB level — prevents two accounts sharing the same email
        trim: true,// Removes spaces before and after the email
        lowercase: true,// Normalizes email to lowercase before saving
        match: [emailRegex, 'Please enter a valid email address'],// Validate against emailRegex
    },
     /*All users must be 16 years or onler and 
    Admin Users must be 18 or older*/
    dateOfBirth: {
        type: Date,//Indicate data type as Date
        required: [true, 'Date of Birth is required'],//Mark the dateOfBirth as required
         validate: {// Custom validator to ensure dateOfBirth is a real, past date
            validator: function (v) {
                return v instanceof Date && !isNaN(v.getTime()) && v < new Date();// Checks v is a valid Date object and earlier than now
            },
            message: 'Date of birth must be in the past'// Error message shown when validation fails
        }
    },
    // Field for Password (required for login)
    // Password hashing is done in registration request middleware (not used during dev)
    password: {
        type: String,//Indicate data type as a string
        required: [true, 'field for password is required'],//Mark Password Field as required
        minlength: [8, 'Password must be at least 8 characters long'],// Minimum password length.
        maxlength: [1024, 'Password cannot exceed 1024 characters'],// Maximum password length (allow room for hashed passwords).
        select: false  // Excluded from query results by default — must be explicitly requested to avoid leaking hashed passwords
    },
    /*Field for admin status: 
     ROLE BASED ACCESS CONTROL:
    - true = admin privileges, 
    - false/undefined = regular user
     */
    admin :{
      type: Boolean,//Indicate data type as a boolean
      required: false,// Optional because normal users may not need this field.
      default: false, // New users are regular users unless explicitly made an admin.
    },
},{
    timestamps: true,// Adds createdAt / updatedAt fields (option name is case-sensitive)
    toJSON: {virtuals: true},  
    toObject: {virtuals:true},
});

// Export the userSchema to be used in other parts of the application
module.exports = mongoose.model('Users', userSchema);