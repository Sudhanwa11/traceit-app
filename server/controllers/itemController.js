// server/controllers/itemController.js
const Item = require('../models/Item');
const User = require('../models/User');
const mongoose = require('mongoose');
const { embedItem, MODEL_ID } = require('../services/embedder'); // local (Xenova) text embedder

// OPTIONAL image embedder (CLIP). Safe-optional: if file doesn't exist, we skip image embeddings.
let embedImageFromBuffer = null;
let meanUnit = null;
try {
  ({ embedImageFromBuffer, meanUnit } = require('../services/imageEmbedder'));
} catch { /* image embedding optional */ }

// OPTIONAL GridFS cleanup helper (guarded)
let deleteFromGridFS = async () => {};
try {
  ({ deleteFromGridFS } = require('../services/storage'));
} catch (_) {
  // no-op if storage helper isn't wired yet
}

const CURRENT_EMBEDDING_MODEL = MODEL_ID || 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
const CURRENT_EMBEDDING_DIM = 384;

function requiredMissing(body) {
  const NEED = ['status','itemName','description','mainCategory','subCategory','location'];
  return NEED.filter(k => !body[k] || String(body[k]).trim() === '');
}

/* ----------------------------------
 * Create / Report item  (Multer + GridFS)
 * ---------------------------------- */
exports.createItem = async (req, res) => {
  try {
    if (process.env.DEBUG_ITEMS === '1') {
      console.log('[createItem] content-type:', req.headers['content-type']);
      console.log('[createItem] body keys:', Object.keys(req.body || {}));
      console.log('[createItem] files:', Array.isArray(req.files) ? req.files.map(f => ({
        name: f.originalname, type: f.mimetype, size: f.size
      })) : req.files);
    }

    const {
      status, itemName, description, mainCategory, subCategory,
      location, currentLocation, retrievalImportance, priceRange
    } = req.body || {};

    const missing = requiredMissing(req.body || {});
    if (missing.length) {
      return res.status(400).json({
        msg: `Missing required fields: ${missing.join(', ')}`,
        received: req.body || {}
      });
    }

    const newItem = new Item({
      status,
      itemName,
      description,
      mainCategory,
      subCategory,
      location,
      currentLocation,
      retrievalImportance,
      priceRange,
      reportedBy: req.user.id,
    });

    // ⬇️ Multer path: req.files = [{ buffer, originalname, mimetype, size, ... }]
    if (Array.isArray(req.files) && req.files.length > 0) {
      if (!mongoose.connection?.db) {
        return res.status(500).json({ msg: 'Database not ready for file upload' });
      }

      const bucket = new mongoose.mongo.GridFSBucket(
        mongoose.connection.db,
        { bucketName: 'uploads' } // keep consistent with your file download routes
      );

      newItem.media = [];
      const imageVecs = [];

      for (const f of req.files) {
        // Write the in-memory buffer to GridFS
        const uploadStream = bucket.openUploadStream(f.originalname, {
          contentType: f.mimetype,
        });
        uploadStream.end(f.buffer);

        await new Promise((resolve, reject) => {
          uploadStream.on('finish', () => {
            newItem.media.push({
              fileId: String(uploadStream.id),
              filename: uploadStream.filename,
              contentType: f.mimetype,
            });
            resolve();
          });
          uploadStream.on('error', reject);
        });

        // Optional: compute an image vector for fusion if embedder available
        if (embedImageFromBuffer) {
          try {
            const v = await embedImageFromBuffer(f.buffer);
            if (Array.isArray(v) && v.length) imageVecs.push(v);
          } catch (e) {
            if (process.env.DEBUG_ITEMS === '1') {
              console.warn('image embedding failed:', e?.message || e);
            }
          }
        }
      }

      // Average image vectors and L2-normalize
      if (imageVecs.length && meanUnit) {
        newItem.imageEmbedding = meanUnit(imageVecs);
      }
    }

    // Local TEXT embedding (384-d, no external API)
    try {
      newItem.descriptionEmbedding = await embedItem(newItem);
      newItem.embeddingModel = CURRENT_EMBEDDING_MODEL;
      newItem.embeddingDim = CURRENT_EMBEDDING_DIM;
    } catch (e) {
      console.error('⚠️ Local text embedding failed:', e?.message || e);
      newItem.descriptionEmbedding = [];
      newItem.embeddingModel = '';
      newItem.embeddingDim = 0;
    }

    const saved = await newItem.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error in createItem:', err);
    return res.status(500).json({ msg: 'Server Error' });
  }
};

/* ----------------------------------
 * Public feed: all Found (not retrieved)
 * ---------------------------------- */
exports.getFoundItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'Found', isRetrieved: false })
      .populate('reportedBy', 'name department')
      .sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

/* ----------------------------------
 * Get single item by id
 * ---------------------------------- */
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name department phoneNumber');

    if (!item) return res.status(404).json({ msg: 'Item not found' });
    return res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    return res.status(500).send('Server Error');
  }
};

/* ----------------------------------
 * Items reported by current user
 * ---------------------------------- */
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user.id })
      .sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

/* ----------------------------------
 * Retrieved items reported by current user
 * ---------------------------------- */
exports.getMyRetrievedItems = async (req, res) => {
  try {
    const items = await Item.find({
      reportedBy: req.user.id,
      isRetrieved: true
    }).sort({ updatedAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

/* ----------------------------------
 * Semantic Matches for a LOST item
 * - Tries Atlas vectorSearch (text + optional image fusion)
 * - Falls back to local cosine similarity if Atlas is unavailable
 * ---------------------------------- */
exports.findSemanticMatches = async (req, res) => {
  try {
    const lostItem = await Item.findById(req.params.id);
    if (!lostItem) return res.status(404).json({ msg: 'Lost item not found.' });

    // Only run matching for true Lost items that are still unresolved
    if (lostItem.status !== 'Lost' || lostItem.isRetrieved) {
      return res.json({ matches: [], selfMatchCount: 0 });
    }

    // Re-embed if missing OR model/dim mismatch
    const needsReembed =
      !Array.isArray(lostItem.descriptionEmbedding) ||
      lostItem.descriptionEmbedding.length !== CURRENT_EMBEDDING_DIM ||
      lostItem.embeddingModel !== CURRENT_EMBEDDING_MODEL ||
      lostItem.embeddingDim !== CURRENT_EMBEDDING_DIM;

    if (needsReembed) {
      try {
        lostItem.descriptionEmbedding = await embedItem(lostItem);
        lostItem.embeddingModel = CURRENT_EMBEDDING_MODEL;
        lostItem.embeddingDim = CURRENT_EMBEDDING_DIM;
        await lostItem.save();
      } catch (embedErr) {
        console.error('Embedding lost item failed:', embedErr?.message || embedErr);
        return res.status(500).json({ msg: 'Embedding unavailable right now.' });
      }
    }

    // ----- knobs -----
    const TEXT_W   = 0.6;     // weight text
    const IMG_W    = 0.4;     // weight image (used only if both sides have image vectors)
    const LIMIT    = Math.min(Number(req.query.limit) || 12, 50);
    const MIN_SCORE = 0.45;   // fusion threshold
    const lostVec  = lostItem.descriptionEmbedding;
    const hasLostImage = Array.isArray(lostItem.imageEmbedding) && lostItem.imageEmbedding.length > 0;

    // helper: cosine similarity (embeddings are L2-normalized)
    const cosine = (a, b) => {
      let s = 0, n = Math.min(a.length, b.length);
      for (let i = 0; i < n; i++) s += a[i] * b[i];
      return s;
    };

    // ---------- Try Atlas TEXT vectorSearch ----------
    let base = new Map();
    let atlasOk = false;
    try {
      const textResults = await Item.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index', // 384-d index on descriptionEmbedding
            path: 'descriptionEmbedding',
            queryVector: lostVec,
            numCandidates: 300,
            limit: 60,
            filter: { status: 'Found', isRetrieved: false },
          }
        },
        {
          $project: {
            _id: 1,
            itemName: 1,
            description: 1,
            mainCategory: 1,
            subCategory: 1,
            location: 1,
            media: 1,
            reportedBy: 1,
            createdAt: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]);

      for (const m of textResults) {
        base.set(String(m._id), { doc: m, textScore: m.score || 0, imgScore: 0 });
      }
      atlasOk = true;
    } catch (atlasErr) {
      if (process.env.DEBUG_ITEMS === '1') {
        console.warn('Atlas text vectorSearch unavailable, will fallback:', atlasErr?.message || atlasErr);
      }
    }

    // ---------- (Atlas) IMAGE vectorSearch fusion (optional) ----------
    if (atlasOk && hasLostImage) {
      try {
        const imgResults = await Item.aggregate([
          {
            $vectorSearch: {
              index: 'image_vector_index',  // e.g., 512-d CLIP vectors
              path: 'imageEmbedding',
              queryVector: lostItem.imageEmbedding,
              numCandidates: 300,
              limit: 60,
              filter: { status: 'Found', isRetrieved: false },
            }
          },
          { $project: { _id: 1, score: { $meta: 'vectorSearchScore' } } }
        ]);
        for (const m of imgResults) {
          const k = String(m._id);
          const s = m.score || 0;
          if (base.has(k)) base.get(k).imgScore = s;
          else base.set(k, { doc: { _id: m._id }, textScore: 0, imgScore: s });
        }
      } catch (atlasImgErr) {
        if (process.env.DEBUG_ITEMS === '1') {
          console.warn('Atlas image vectorSearch skipped:', atlasImgErr?.message || atlasImgErr);
        }
      }
    }

    // ---------- If Atlas gave us candidates, fuse and return ----------
    if (atlasOk && base.size > 0) {
      const fused = [];
      let selfMatchCount = 0;
      for (const { doc, textScore, imgScore } of base.values()) {
        if (doc.reportedBy && String(doc.reportedBy) === String(lostItem.reportedBy)) {
          selfMatchCount++;
          continue;
        }
        const fusedScore = TEXT_W * (textScore || 0) + (hasLostImage ? IMG_W * (imgScore || 0) : 0);
        if (fusedScore >= MIN_SCORE) fused.push({ doc, fusedScore });
      }
      fused.sort((a, b) => b.fusedScore - a.fusedScore);
      const matches = fused.slice(0, LIMIT).map(x => ({ ...x.doc, score: x.fusedScore }));
      return res.json({ matches, selfMatchCount });
    }

    // ---------- Local fallback: cosine over Found items ----------
    // Pull candidates
    const candidates = await Item.find({ status: 'Found', isRetrieved: false })
      .select('_id itemName description mainCategory subCategory location media createdAt reportedBy descriptionEmbedding imageEmbedding embeddingModel embeddingDim');

    // Ensure each has TEXT embedding and correct model; compute & persist if missing/stale
    for (const c of candidates) {
      const needs = !Array.isArray(c.descriptionEmbedding) ||
                    c.descriptionEmbedding.length !== CURRENT_EMBEDDING_DIM ||
                    c.embeddingModel !== CURRENT_EMBEDDING_MODEL ||
                    c.embeddingDim !== CURRENT_EMBEDDING_DIM;
      if (needs) {
        try {
          c.descriptionEmbedding = await embedItem(c);
          c.embeddingModel = CURRENT_EMBEDDING_MODEL;
          c.embeddingDim = CURRENT_EMBEDDING_DIM;
          await Item.updateOne(
            { _id: c._id },
            { $set: {
                descriptionEmbedding: c.descriptionEmbedding,
                embeddingModel: c.embeddingModel,
                embeddingDim: c.embeddingDim
              }
            }
          );
        } catch (e) {
          if (process.env.DEBUG_ITEMS === '1') {
            console.warn('Failed to embed candidate', c._id.toString(), e?.message || e);
          }
          c.descriptionEmbedding = [];
        }
      }
    }

    // Score locally
    const scored = candidates
      .filter(c => Array.isArray(c.descriptionEmbedding) && c.descriptionEmbedding.length > 0)
      .map(c => {
        const textScore = cosine(lostVec, c.descriptionEmbedding);
        let fusedScore = TEXT_W * textScore;

        const hasCandImg = Array.isArray(c.imageEmbedding) && c.imageEmbedding.length > 0;
        if (hasLostImage && hasCandImg) {
          // Optional: unit-normalized vectors assumed; otherwise normalize first
          const imgScore = cosine(lostItem.imageEmbedding, c.imageEmbedding);
          fusedScore = TEXT_W * textScore + IMG_W * imgScore;
        }
        return { doc: c.toObject(), fusedScore };
      })
      .filter(x => x.fusedScore >= MIN_SCORE)
      .sort((a, b) => b.fusedScore - a.fusedScore);

    // Filter out self matches
    let selfMatchCount = 0;
    const valid = [];
    for (const m of scored) {
      const isSelf = m.doc.reportedBy && String(m.doc.reportedBy) === String(lostItem.reportedBy);
      if (isSelf) selfMatchCount++;
      else {
        valid.push({ ...m.doc, score: m.fusedScore });
      }
      if (valid.length >= LIMIT) break;
    }

    return res.json({ matches: valid, selfMatchCount });
  } catch (err) {
    console.error('Error in findSemanticMatches:', err);
    return res.status(500).json({ msg: 'Server Error' });
  }
};


/* ----------------------------------
 * Delete an item (owner only) + cleanup GridFS media
 * ---------------------------------- */
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ msg: 'Item not found' });

    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Best-effort cleanup of GridFS media
    if (Array.isArray(item.media) && item.media.length > 0) {
      for (const m of item.media) {
        try { await deleteFromGridFS(m.fileId, 'uploads'); } catch (_) {}
      }
    }

    await Item.findByIdAndDelete(req.params.id);
    return res.json({ msg: 'Item removed successfully' });
  } catch (err) {
    console.error('Error in deleteItem:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    return res.status(500).send('Server Error');
  }
};
