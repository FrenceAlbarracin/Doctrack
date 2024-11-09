const mongoose = require('mongoose');

// Document schema
const documentSchema = new mongoose.Schema({
    documentName: {
        type: String,
        required: true,
        unique: true,
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true,
    },
    recipient: {
        type: String,
        required: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    lastModified: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'inactive', 'inTransit'],
        default: 'pending',
    },
    currentLocation: {
        type: String,
        required: true,
    },
    originOffice: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

// Add this to debug queries
documentSchema.pre('find', function() {
    console.log('Finding documents with query:', this.getQuery());
});

// Create the Document model
const Document = mongoose.model('AllDocument', documentSchema);

module.exports = Document;
