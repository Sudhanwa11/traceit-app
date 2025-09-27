// server/models/Claim.js
const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    claimer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    itemReporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Proof is no longer required on initial claim
    proof: {
        type: String,
    },
    status: {
        type: String,
        enum: [
            'pending-chat-approval', // Initial state after claim is made
            'chat-rejected',
            'chat-active',           // Chat approved, conversation can happen
            'resolved-by-reporter',  // Reporter is satisfied
            'retrieval-confirmed'    // Claimer confirms retrieval
        ],
        default: 'pending-chat-approval',
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Claim', ClaimSchema);