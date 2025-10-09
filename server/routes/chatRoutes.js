// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const uploadChat = require('../middleware/chatUpload');
const { getConversationByClaim, postMessage } = require('../controllers/chatController');

// unchanged
router.get('/conversation/:claimId', auth, getConversationByClaim);

//accept multipart with images
router.post('/message', auth, uploadChat, postMessage);

module.exports = router;
