// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getConversationByClaim, postMessage } = require('../controllers/chatController');

// @route   GET /api/chat/conversation/:claimId
// @desc    Get or create a conversation for a claim
router.get('/conversation/:claimId', authMiddleware, getConversationByClaim);

// @route   POST /api/chat/messages
// @desc    Post a new message to a conversation
router.post('/messages', authMiddleware, postMessage);

module.exports = router;