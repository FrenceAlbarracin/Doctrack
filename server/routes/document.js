const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const validateDocumentId = require('../middlewares/docuHistoryMiddleware');
const documentHandler = require('../handlers/documentsHandler')

// Debug route
router.get('/debug', documentHandler.debug);

// Add these routes at the top of your routes
router.get('/daily-stats', documentController.getDailyStats);
router.get('/recipient-stats', documentController.getRecipientStats);

// Main documents route
router.get('/all', documentHandler.getAll);

router.get('/status-counts', documentHandler.statusCount);

// Route to get all document transfer history with optional filters
router.get('/history', documentController.getAllDocumentHistory);

// Route to get movement history of a specific document by ID
router.get('/:id/history', validateDocumentId, documentController.getDocumentHistoryById);
// Add this after your existing routes
router.get('/history/:id', documentHandler.historyID);

router.put('/update-status/:id', documentHandler.updateStatus);

router.put('/forward/:id', documentHandler.forward);

module.exports = router;
