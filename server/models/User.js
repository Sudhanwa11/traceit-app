// server/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Email must be unique
    },
    password: {
        type: String,
        required: true,
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true, // Roll number must be unique
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    servicePoints: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true 
});

module.exports = mongoose.model('User', UserSchema);