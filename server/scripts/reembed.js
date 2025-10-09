require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/Item');
const { embedItem } = require('../services/embedder');
// optional:
const { embedImageFromBuffer, meanUnit } = require('../services/imageEmbedder');

const { GridFSBucket, ObjectId } = require('mongodb');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

  const cur = Item.find({
    $or: [
      { descriptionEmbedding: { $exists: false } },
      { descriptionEmbedding: { $size: 0 } },
      { imageEmbedding: { $exists: false } }, // include if you want to compute images too
    ]
  }).cursor();

  let n = 0;
  for (let doc = await cur.next(); doc != null; doc = await cur.next()) {
    try {
      // text
      doc.descriptionEmbedding = await embedItem(doc);

      // image (optional): average all item media
      if (Array.isArray(doc.media) && doc.media.length) {
        const vecs = [];
        for (const m of doc.media) {
          try {
            const id = new ObjectId(m.fileId);
            const chunks = [];
            await new Promise((resolve, reject) => {
              bucket.openDownloadStream(id)
                .on('data', (c) => chunks.push(c))
                .on('error', reject)
                .on('end', resolve);
            });
            const buf = Buffer.concat(chunks);
            vecs.push(await embedImageFromBuffer(buf));
          } catch (_) {}
        }
        if (vecs.length) doc.imageEmbedding = meanUnit(vecs);
      }

      await doc.save();
      if (++n % 25 === 0) console.log('Re-embedded', n);
    } catch (e) {
      console.error('Failed for', doc._id, e?.message || e);
    }
  }

  console.log('Done. Re-embedded:', n);
  await mongoose.disconnect();
  process.exit(0);
})();
