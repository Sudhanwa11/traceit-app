// server/models/Item.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Lost', 'Found'],
      required: true,
    },

    itemName: { type: String, required: true },
    description: { type: String, required: true },

    mainCategory: {
      type: String,
      required: true,
      enum: [
        'Electronics', 'Apparel', 'Books & Stationery', 'ID Cards & Documents',
        'Keys', 'Bags & Luggage', 'Accessories', 'Personal Care',
        'Sports Equipment', 'Musical Instruments', 'Medical Items',
        'Eyewear', 'Umbrellas', 'Containers', 'Other',
      ],
    },
    subCategory: { type: String, required: true },

    // ===== Embeddings =====
    // 384-dim multilingual text embedding
    descriptionEmbedding: { type: [Number], default: [] },

    // Track which model produced the embedding (critical when you change models)
    embeddingModel: { type: String, default: '' }, // e.g. 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
    embeddingDim:   { type: Number, default: 0 },  // e.g. 384

    // Optional 512-dim CLIP image embedding (if you enable image fusion)
    imageEmbedding: { type: [Number], default: [] },

    // ===== Metadata =====
    location: { type: String, required: true },
    currentLocation: { type: String },

    retrievalImportance: {
      type: String,
      enum: ['Most Important', 'Somewhat Important', 'Normal Importance', 'Trying Out Luck'],
    },
    priceRange: {
      type: String,
      enum: ['< ₹500', '₹500 - ₹2000', '₹2000 - ₹5000', '> ₹5000', 'Priceless'],
    },

    media: [
      {
        fileId: String,
        filename: String,
        contentType: String,
      },
    ],

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    isRetrieved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Helpful filter indexes (feeds/matching)
ItemSchema.index({ status: 1, isRetrieved: 1, createdAt: -1 });
// If you frequently filter by category too, this helps:
ItemSchema.index({ status: 1, isRetrieved: 1, mainCategory: 1, createdAt: -1 });

module.exports = mongoose.model('Item', ItemSchema);
