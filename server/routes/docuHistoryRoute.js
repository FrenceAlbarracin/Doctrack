const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const validateDocumentId = require('../middlewares/docuHistoryMiddleware');

// Route to get movement history of a specific document by ID
router.get('/:id/history', validateDocumentId, documentController.getDocumentHistoryById);

// Route to get all document transfer history with optional filters
router.get('/history', documentController.getAllDocumentHistory);

module.exports = router;
