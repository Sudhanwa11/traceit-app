// server/controllers/chatController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const mongoose = require('mongoose');

exports.getConversationByClaim = async (req, res) => {
  try {
    const { claimId } = req.params;

    // 1) Ensure claim exists and populate only valid paths
    const claim = await Claim.findById(claimId)
      .populate('claimer', 'name department')
      .populate('itemReporter', 'name department')
      .populate('item', 'itemName status'); // adjust field names if your Item schema differs

    if (!claim) {
      return res.status(404).json({ msg: 'Claim not found' });
    }

    // 2) Find or create conversation using claimer + itemReporter
    let conversation = await Conversation.findOne({ claim: claimId })
      .populate('participants', 'name department'); // valid path

    if (!conversation) {
      conversation = new Conversation({
        claim: claimId,
        participants: [claim.claimer, claim.itemReporter],
      });
      await conversation.save();

      // populate participants after save
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name department');
    }

    // 3) Build a consistent header for the client (ChatPage)
    const header = {
      // NOTE: You don't know who "self" is server-side unless you want to compare with req.user.id.
      // If you wish, you can compute it here; otherwise return both roles plainly:
      self: undefined, // let client infer "self" from AuthContext.user
      other: undefined, // let client infer "other" based on participants vs. self
      roles: {
        claimer: claim.claimer
          ? { _id: claim.claimer._id, name: claim.claimer.name, department: claim.claimer.department, role: 'Requester' }
          : null,
        reporter: claim.itemReporter
          ? { _id: claim.itemReporter._id, name: claim.itemReporter.name, department: claim.itemReporter.department, role: 'Reporter' }
          : null,
      },
      // Minimal item context
      item: claim.item
        ? { id: claim.item._id, name: claim.item.itemName, status: claim.item.status }
        : null,
    };

    // 4) Messages (populate only valid 'sender')
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .populate('sender', 'name department'); // valid path

    // 5) Return conversation plus header (do NOT include invalid populate paths)
    return res.json({
      conversation: {
        _id: conversation._id,
        claim: conversation.claim,
        participants: conversation.participants, // populated users
        header, // client can render names/roles without guessing
      },
      messages,
    });
  } catch (err) {
    console.error('getConversationByClaim error:', err.message);
    return res.status(500).send('Server Error');
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { conversationId, text = '' } = req.body;
    const attachments = [];

    // If files came in, push them to GridFS
    if (Array.isArray(req.files) && req.files.length > 0) {
      if (!mongoose.connection?.db) {
        return res.status(500).json({ msg: 'DB not ready for uploads' });
      }
      const bucket = new mongoose.mongo.GridFSBucket(
        mongoose.connection.db,
        { bucketName: 'uploads' }
      );

      for (const f of req.files) {
        const stream = bucket.openUploadStream(f.originalname, {
          contentType: f.mimetype,
        });
        stream.end(f.buffer);

        // wait for finish and collect metadata
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve, reject) => {
          stream.on('finish', () => {
            attachments.push({
              fileId: String(stream.id),
              filename: stream.filename,
              contentType: f.mimetype,
              length: stream.length || f.size
            });
            resolve();
          });
          stream.on('error', reject);
        });
      }
    }

    const newMessage = new Message({
      conversationId,
      text,
      sender: req.user.id,
      attachments
    });

    const savedMessage = await newMessage.save();
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'name department');

    // Emit to recipient as before
    const conversation = await Conversation.findById(conversationId);
    const recipientId = conversation.participants
      .find(p => p.toString() !== req.user.id)?.toString();

    if (recipientId && Array.isArray(req.onlineUsers)) {
      const recipientSocket = req.onlineUsers.find(u => u.userId === recipientId);
      if (recipientSocket && req.io) {
        req.io.to(recipientSocket.socketId).emit('receiveMessage', populatedMessage);
      }
    }

    return res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('postMessage error:', err.message);
    return res.status(500).send('Server Error');
  }
};
