// server/models/Message.js
const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  fileId:   { type: String, required: true },
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  length:   { type: Number }
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: { type: String, default: '' },
  // NEW
  attachments: { type: [AttachmentSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
