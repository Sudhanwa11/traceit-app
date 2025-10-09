// server/middleware/chatUpload.js
const multer = require('multer');

const ACCEPT = new Set(['image/jpeg','image/png','image/webp','image/gif']);

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB × 5
  fileFilter: (_req, file, cb) => {
    if (!ACCEPT.has(file.mimetype)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  }
});

module.exports = upload.array('files', 5);
