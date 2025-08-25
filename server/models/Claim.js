// server/models/Claim.js
const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    claimer: { // The user who lost the item and is making the claim
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    itemReporter: { // The user who found the item
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    proof: { // The text proof of ownership provided by the claimer
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Claim', ClaimSchema);