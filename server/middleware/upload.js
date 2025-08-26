// server/middleware/upload.js
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
require('dotenv').config();

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = `media-${Date.now()}${path.extname(file.originalname)}`;
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads' // Collection name in MongoDB
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({ storage });

module.exports = upload;