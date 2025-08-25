// server/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 10000000}, // Limit file size to 10MB
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
});

// Check file type
function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images and Videos Only!');
    }
}

module.exports = upload;