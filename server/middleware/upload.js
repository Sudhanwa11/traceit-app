// server/middleware/upload.js
const multer = require('multer');

const ACCEPTED = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime',
]);

const upload = multer({
  storage: multer.memoryStorage(),               // we'll stream buffers to GridFS
  limits: { files: 5, fileSize: 10 * 1024 * 1024 }, // 10MB each, adjust as needed
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED.has(file.mimetype)) return cb(null, true);
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

module.exports = upload;
