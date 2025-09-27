// server/models/RewardClaim.js
const mongoose = require('mongoose');

const RewardClaimSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rewardName: {
        type: String,
        required: true,
    },
    pointsSpent: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RewardClaim', RewardClaimSchema);