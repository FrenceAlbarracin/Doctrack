const express = require('express');
const router = express.Router();
const AllDocument = require('../models/AllDocument');

// Debug route
router.get('/debug', async (req, res) => {
    try {
        const documents = await AllDocument.find({});
        console.log('Debug documents found:', documents);
        res.json({
            count: documents.length,
            documents: documents
        });
    } catch (error) {
        console.error('Debug route error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Main documents route
router.get('/documents/all', async (req, res) => {
    try {
        console.log('Fetching all documents...');
        const documents = await AllDocument.find({}).sort({ createdAt: -1 });
        console.log(`Found ${documents.length} documents`);
        res.json(documents);
    } catch (error) {
        console.error('Error in /documents/all:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
