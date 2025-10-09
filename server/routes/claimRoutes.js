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

// POST /api/claims/:itemId - User initiates a claim
router.post('/:itemId', authMiddleware, createClaim);

// GET /api/claims/received - Claims on items reported by the logged-in user
router.get('/received', authMiddleware, getReceivedClaims);

// GET /api/claims/made - Claims made by the logged-in user
router.get('/made', authMiddleware, getMadeClaims);

// PUT /api/claims/:claimId/respond-chat - Reporter accepts or rejects chat request
router.put('/:claimId/respond-chat', authMiddleware, respondToChatRequest);

// PUT /api/claims/:claimId/resolve - Reporter marks the claim as resolved
router.put('/:claimId/resolve', authMiddleware, reporterResolveClaim);

// PUT /api/claims/:claimId/confirm - Claimer confirms retrieval (final step)
router.put('/:claimId/confirm', authMiddleware, claimerConfirmRetrieval);

module.exports = router;
