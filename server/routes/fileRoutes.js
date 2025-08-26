// server/routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const { getFile } = require('../controllers/fileController');

// @route   GET /api/files/:filename
// @desc    Display a single file (image/video)
router.get('/:filename', getFile);

module.exports = router;