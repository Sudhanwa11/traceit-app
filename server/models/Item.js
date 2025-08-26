// server/models/Item.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['Lost', 'Found'],
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    mainCategory: {
        type: String,
        required: true,
        enum: [
            'Electronics', 'Apparel', 'Books & Stationery', 'ID Cards & Documents', 
            'Keys', 'Bags & Luggage', 'Accessories', 'Personal Care', 
            'Sports Equipment', 'Musical Instruments', 'Medical Items', 
            'Eyewear', 'Umbrellas', 'Containers', 'Other'
        ],
    },
    subCategory: {
        type: String,
        required: true,
    },
    descriptionEmbedding: {
        type: [Number],
    },
    location: {
        type: String,
        required: true,
    },
    currentLocation: {
        type: String,
    },
    retrievalImportance: {
        type: String,
        enum: ['Most Important', 'Somewhat Important', 'Normal Importance', 'Trying Out Luck'],
    },
    priceRange: {
        type: String,
        enum: ['< ₹500', '₹500 - ₹2000', '₹2000 - ₹5000', '> ₹5000', 'Priceless'],
    },
    media: [{
        fileId: String,
        filename: String,
        contentType: String,
    }],
    // The redundant "images" field has been removed from here
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    isRetrieved: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', ItemSchema);