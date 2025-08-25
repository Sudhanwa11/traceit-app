// server/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    registerUser, 
    loginUser, 
    getLoggedInUser 
} = require('../controllers/authController');

// @route   GET /api/auth
// @desc    Get logged-in user data
// @access  Private
// This was the route causing the 404 error. It needs to be just '/'.
router.get('/', authMiddleware, getLoggedInUser);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

module.exports = router;