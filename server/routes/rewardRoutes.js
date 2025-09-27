// server/routes/rewardRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { claimReward } = require('../controllers/rewardController');

// @route   POST /api/rewards/claim
// @desc    A user claims a reward
// @access  Private
router.post('/claim', authMiddleware, claimReward);

module.exports = router;