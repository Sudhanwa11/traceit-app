// server/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { submitFeedback } = require('../controllers/feedbackController');

// @route   POST /api/feedback
// @desc    Submit user feedback
// @access  Private
router.post('/', authMiddleware, submitFeedback);

module.exports = router;