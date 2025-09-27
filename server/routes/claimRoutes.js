// server/routes/claimRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    createClaim,
    getReceivedClaims,
    getMadeClaims,
    respondToChatRequest,
    reporterResolveClaim,
    claimerConfirmRetrieval
} = require('../controllers/claimController');

// POST /api/claims/:itemId - A user initiates a claim
router.post('/:itemId', authMiddleware, createClaim);

// GET /api/claims/received - Get claims on items you reported
router.get('/received', authMiddleware, getReceivedClaims);

// GET /api/claims/made - Get claims you have made
router.get('/made', authMiddleware, getMadeClaims);

// PUT /api/claims/:claimId/respond-chat - Reporter accepts/rejects the chat request
router.put('/:claimId/respond-chat', authMiddleware, respondToChatRequest);

// PUT /api/claims/:claimId/resolve - Reporter marks the claim as resolved
router.put('/:claimId/resolve', authMiddleware, reporterResolveClaim);

// PUT /api/claims/:claimId/confirm - Claimer confirms they have the item
router.put('/:claimId/confirm', authMiddleware, claimerConfirmRetrieval);

module.exports = router;