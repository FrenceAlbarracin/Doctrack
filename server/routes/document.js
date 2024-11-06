const express = require('express');
const router = express.Router();
const { isAdmin, isOfficer } = require('../middlewares/auth');
const documentController = require('../controllers/documentController');
const AllDocument = require('../models/AllDocument');
const { 
    validateDocument, 
    validateTransfer,
    validateDocumentCreation 
} = require('../middlewares/documentMiddleware');

// Place the /documents/all route BEFORE any parameterized routes
router.get('/documents/all', async (req, res) => {
    try {
        console.log('Attempting to fetch documents...');
        const documents = await AllDocument.find({}).lean();
        console.log('Documents found:', documents);
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: error.message });
    }
});

// Then place all other routes
router.post('/', [isAdmin, validateDocumentCreation], documentController.createDocument);
router.get('/', isOfficer, documentController.getAllDocuments);
router.get('/:id', [isOfficer, validateDocument], documentController.getDocument);
router.put('/:id/transfer', [isOfficer, validateDocument, validateTransfer], documentController.transferDocument);
router.delete('/:id', [isAdmin, validateDocument], documentController.deleteDocument);

module.exports = router;
