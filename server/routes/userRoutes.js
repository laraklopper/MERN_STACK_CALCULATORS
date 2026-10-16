// userRoutes.js
/*
fetchUsers
fetchCurrentUser
editUser
editPassword
deleteUser
*/
require('dotenv').config()
const express = require('express');
const router = express.Router()
const User = require('../models/userSchema')

/*──────────────────────────── GET ROUTES ─────────────────────────────────────
   GET: READ — Used to fetch information from the database
────────────────────────────────────────────────────────────────────────────────*/
router.get('/fetchUsers', async (req, res) => {
    try {
        const users = await User.find()
        .select('-password')
        .exec()

        console.log(`[SUCCESS: userRoutes.js, GET /fetchUsers] Returned ${users.length} users`);
        return res.status(200).json(users);
    } catch (error) {
        console.error('[ERROR: userRoutes.js, GET /] Error fetching users:', error.message);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
})
//Route to fetch currentUser data
// Send a GET request to /users/me endpoint 
router.get('/me', async(req, res) => {
    try {
        const userId = req.user.userId;// The token payload signed in authRoutes.js uses `userId`
        const user = await User.findById(userId)
        .select('-password')
        .exec();

        //Conditional rendering to check if user is found
        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            }); 
        }

        console.log(`[RESPONSE: userRoutes]`, user);
        return res.status(200).json(user); 
    } catch (error) {
         console.error('Error fetching current user:', error);
        res.status(500).json({
            success: false, 
            error: 'An error occurred while fetching the current user'
        });
    }
})
/*──────────────────────────── PATCH ROUTES ───────────────────────────────────
   PATCH: UPDATE — Used to partially update information in the database
────────────────────────────────────────────────────────────────────────────────*/
/*──────────────────────────── DELETE ROUTES ───────────────────────────────────
    DELETE: Used to remove an item from the database
 ────────────────────────────────────────────────────────────────────────────────*/

 module.exports = router