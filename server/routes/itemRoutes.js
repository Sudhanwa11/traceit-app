// server/routes/itemRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    createItem,
    getFoundItems,
    getMyItems,
    getItemById,
    getMyRetrievedItems,
    findSemanticMatches,
    deleteItem 
} = require('../controllers/itemController');

const upload = require('../middleware/upload');

// @route   POST /api/items
// Modify this line to include the upload middleware
router.post('/', authMiddleware, upload.array('media', 5), createItem);

// @route   POST /api/items
// @desc    Report a new lost or found item
// @access  Private (requires token)
router.post('/', authMiddleware, createItem);

// @route   GET /api/items/found
// @desc    Get all publicly listed "Found" items
// @access  Public
router.get('/found', getFoundItems);

// @route   GET /api/items/my-items
// @desc    Get all items reported by the logged-in user
// @access  Private (requires token)
router.get('/my-items', authMiddleware, getMyItems);

// @route   GET /api/items/:id
// @desc    Get a single item by its ID
// @access  Public
router.get('/:id', getItemById);

// @route   GET /api/items/my-retrieved
// @desc    Get all successfully retrieved items reported by the logged-in user
// @access  Private (requires token)
router.get('/my-retrieved', authMiddleware, getMyRetrievedItems);

// @route   GET /api/items/matches/:itemId
// @desc    Find semantic matches for a lost item using its ID
// @access  Private (requires token)
router.get('/matches/:id', authMiddleware, findSemanticMatches);

router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;