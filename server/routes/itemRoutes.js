const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
// ⬇️ Multer middleware (memory storage) — we’ll stream buffers to GridFS in the controller
const upload = require('../middleware/upload');

const {
  createItem,
  getFoundItems,
  getMyItems,
  getItemById,
  getMyRetrievedItems,
  findSemanticMatches,
  deleteItem,
} = require('../controllers/itemController');

// POST /api/items
// Multer parses multipart; files are available on req.files (field name MUST be 'media')
router.post('/', authMiddleware, upload.array('media', 5), createItem);

// Public feed: found items
router.get('/found', getFoundItems);

// Items reported by current user
router.get('/my-items', authMiddleware, getMyItems);

// Retrieved items reported by current user
router.get('/my-retrieved', authMiddleware, getMyRetrievedItems);

// Semantic matches for a LOST item
router.get('/matches/:id', authMiddleware, findSemanticMatches);

// Single item by id
router.get('/:id', getItemById);

// Delete item
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;
