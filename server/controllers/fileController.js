// server/controllers/fileController.js
const mongoose = require('mongoose');

let gfs;
mongoose.connection.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
    });
});

exports.getFile = async (req, res) => {
    try {
        const file = await gfs.find({ filename: req.params.filename }).toArray();
        if (!file || file.length === 0) {
            return res.status(404).json({ err: 'No file exists' });
        }
        // Stream the file to the browser
        const readstream = gfs.openDownloadStreamByName(req.params.filename);
        readstream.pipe(res);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};