// server/routes/claimRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    createClaim, 
    getReceivedClaims, 
    respondToClaim 
} = require('../controllers/claimController');

// @route   POST /api/claims/:itemId
// @desc    A user claims an item they believe is theirs
// @access  Private
router.post('/:itemId', authMiddleware, createClaim);

// @route   GET /api/claims/received
// @desc    Get all claims received by the logged-in user for items they reported
// @access  Private
router.get('/received', authMiddleware, getReceivedClaims);

// @route   PUT /api/claims/:claimId/respond
// @desc    The item reporter responds (approves/rejects) a claim
// @access  Private
router.put('/:claimId/respond', authMiddleware, respondToClaim);

module.exports = router;