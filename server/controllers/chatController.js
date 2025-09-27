// server/controllers/chatController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Claim = require('../models/Claim');

exports.getConversationByClaim = async (req, res) => {
    try {
        let conversation = await Conversation.findOne({ claim: req.params.claimId });

        if (!conversation) {
            // If no conversation exists for this claim, create one
            const claim = await Claim.findById(req.params.claimId);
            if (!claim) return res.status(404).json({ msg: 'Claim not found' });

            conversation = new Conversation({
                claim: req.params.claimId,
                participants: [claim.claimer, claim.itemReporter],
            });
            await conversation.save();
        }

        const messages = await Message.find({ conversationId: conversation._id }).populate('sender', 'name');
        res.json({ conversation, messages });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.postMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const newMessage = new Message({
            conversationId,
            text,
            sender: req.user.id,
        });

        const savedMessage = await newMessage.save();
        const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'name');

        // Emit the message via Socket.IO to the other participant
        const conversation = await Conversation.findById(conversationId);
        const recipientId = conversation.participants.find(p => p.toString() !== req.user.id).toString();

        const recipientSocket = req.onlineUsers.find(user => user.userId === recipientId);
        if (recipientSocket) {
            req.io.to(recipientSocket.socketId).emit("receiveMessage", populatedMessage);
        }

        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};