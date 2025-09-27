// server/models/Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    claim: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Claim',
        required: true,
        unique: true,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);