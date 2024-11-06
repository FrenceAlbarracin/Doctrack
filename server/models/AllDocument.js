const mongoose = require('mongoose');

// Document schema
const documentSchema = new mongoose.Schema({
    documentName: {
        type: String,
        required: true,
        unique: true,
    },
    recipient: {
        type: String,
        required: true,
        immutable: true,
    },
    dateCreated: {
        type: Date,
        required: true,
        timestamps: true
    },
    lastModified: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: '',
    },
   
}, 

);

// Add this to debug queries
documentSchema.pre('find', function() {
    console.log('Finding documents with query:', this.getQuery());
});

// Create the Document model
const Document = mongoose.model('AllDocument', documentSchema);

module.exports = Document;
