const mongoose = require('mongoose');

exports.getFile = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

    // Try to stream by filename
    const cursor = db.collection('uploads.files').find({ filename: req.params.filename }).limit(1);
    const fileDoc = await cursor.next();
    if (!fileDoc) return res.status(404).json({ msg: 'File not found' });

    res.set('Content-Type', fileDoc.contentType || 'application/octet-stream');
    const dl = bucket.openDownloadStreamByName(req.params.filename);
    dl.on('error', () => res.status(404).json({ msg: 'File not found' }));
    dl.pipe(res);
  } catch (e) {
    console.error('getFile error:', e.message);
    res.status(500).send('Server Error');
  }
};
