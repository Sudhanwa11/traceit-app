// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    registerUser, 
    loginUser, 
    getLoggedInUser,
    updateUserDetails,
    viewSensitiveData,
    updateSensitiveData,
    changePassword,        // newly added
    deleteAccount          // newly added
} = require('../controllers/authController');

// @route   GET /api/auth
// @desc    Get logged-in user data
// @access  Private
router.get('/', authMiddleware, getLoggedInUser);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// Update user details
router.put('/update', authMiddleware, updateUserDetails);

// View sensitive data (e.g. Aadhaar)
router.post('/view-sensitive', authMiddleware, viewSensitiveData);

// Update sensitive data (e.g. Aadhaar)
router.put('/update-sensitive', authMiddleware, updateSensitiveData);

// --- NEW ---
// Change password
router.put('/change-password', authMiddleware, changePassword);

// Delete account
router.delete('/delete-account', authMiddleware, deleteAccount);

module.exports = router;
