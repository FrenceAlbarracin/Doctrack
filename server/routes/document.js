const express = require('express');
const router = express.Router();
const AllDocument = require('../models/Document');
const documentController = require('../controllers/documentController');
const validateDocumentId = require('../middlewares/docuHistoryMiddleware');
const DocumentHistory = require('../models/DocumentHistory');

// Debug route
router.get('/debug', async (req, res) => {
    try {
        const documents = await AllDocument.find({});
        console.log('Debug documents found:', documents);
        const org = 'Supreme Student Council';
        const orgDocs = documents.filter(doc => doc.recipient === org);
        console.log('Documents for org:', orgDocs);
        res.json({
            count: documents.length,
            orgCount: orgDocs.length,
            documents: documents
        });
    } catch (error) {
        console.error('Debug route error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add these routes at the top of your routes
router.get('/daily-stats', documentController.getDailyStats);
router.get('/recipient-stats', documentController.getRecipientStats);

// Main documents route
router.get('/documents/all', async (req, res) => {
  try {
      console.log('Fetching all documents...');
      const documents = await AllDocument.find({}).sort({ createdAt: -1 });
      console.log(`Found ${documents.length} documents`);
      console.log(documents)
      res.json(documents);
  } catch (error) {
      console.error('Error in /documents/all:', error);
      res.status(500).json({ error: error.message });
  }
});

router.get('/status-counts', async (req, res) => {
  try {
    const userOrganization = req.query.organization;
    
    if (!userOrganization) {
      return res.status(400).json({ 
        error: 'Organization parameter is required'
      });
    }

    console.log('Checking counts for organization:', userOrganization);

    const acceptCount = await AllDocument.countDocuments({ 
      recipient: userOrganization,
      status: 'Accept'
    });

    const pendingCount = await AllDocument.countDocuments({ 
      recipient: userOrganization,
      status: 'pending'
    });

    const keepingCount = await AllDocument.countDocuments({ 
      recipient: userOrganization,
      status: 'Keeping the Document'
    });
    
    const finishedCount = await AllDocument.countDocuments({ 
      recipient: userOrganization,
      status: 'Delivered'
    });

    const transferredCount = await AllDocument.countDocuments({ 
      recipient: userOrganization,
      status: 'Rejected'
    });
    
    console.log('Counts:', {
      accept: acceptCount,
      pending: pendingCount,
      keeping: keepingCount,
      finished: finishedCount,
      transferred: transferredCount
    });

    res.json({
      accept: acceptCount,
      pending: pendingCount,
      keeping: keepingCount,
      finished: finishedCount,
      transferred: transferredCount
    });
  } catch (error) {
    console.error('Error in status-counts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get all document transfer history with optional filters
router.get('/history', documentController.getAllDocumentHistory);

// Route to get movement history of a specific document by ID
router.get('/:id/history', validateDocumentId, documentController.getDocumentHistoryById);
// Add this after your existing routes
router.get('/history/:id', async (req, res) => {
  try {
    const document = await AllDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Get all history entries from DocumentHistory collection
    const historyEntries = await DocumentHistory.find({ documentId: req.params.id })
      .sort({ date: -1 });

    // Create initial history array with document creation
    const history = [
      {
        date: document.createdAt,
        action: 'Document Created',
        description: `Document "${document.documentName}" was created`,
        actionsTaken: `Document "${document.documentName}" was created`,
        details: {
          documentName: document.documentName,
          serialNumber: document.serialNumber,
          description: document.description || '',
          remarks: document.remarks || ''
        }
      },
      ...historyEntries.map(entry => ({
        date: entry.date,
        action: entry.action,
        description: entry.description,
        actionsTaken: entry.details?.remarks 
          ? `${entry.description} - Remarks: ${entry.details.remarks}`
          : entry.description,
        details: {
          ...entry.details,
          description: entry.description,
          remarks: entry.details?.remarks || ''
        }
      }))
    ];

    res.json(history);
  } catch (error) {
    console.error('Error fetching document history:', error);
    res.status(500).json({ message: 'Error retrieving document history' });
  }
});

router.put('/update-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    // First, get the current document to access its current status
    const currentDocument = await AllDocument.findById(id);
    if (!currentDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Then update the document
    const updatedDocument = await AllDocument.findByIdAndUpdate(
      id,
      { 
        status,
        remarks: remarks || currentDocument.remarks,
        updatedAt: new Date()
      },
      { new: true }
    );

    // Create history entry for status change
    const history = new DocumentHistory({
      documentId: updatedDocument._id,
      action: 'Status Updated',
      description: `Document status changed to "${status}"${remarks ? ` - Remarks: ${remarks}` : ''}`,
      details: {
        previousStatus: currentDocument.status,
        newStatus: status,
        remarks: remarks
      }
    });
    await history.save();

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({ error: 'Failed to update document status' });
  }
});

router.put('/forward/:id', async (req, res) => {
  try {
    const { status, forwardTo, remarks, documentCopy, routePurpose, forwardedBy, forwardedAt } = req.body;
    
    // First get the current document to preserve the current recipient
    const currentDocument = await AllDocument.findById(req.params.id);
    if (!currentDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const forwardedFrom = currentDocument.recipient; // Store the current recipient as forwardedFrom
    
    // Update document status and details
    const document = await AllDocument.findByIdAndUpdate(
      req.params.id,
      {
        status,
        recipient: forwardTo,
        remarks,
        documentCopy,
        routePurpose,
        updatedAt: new Date()
      },
      { new: true }
    );

    // Create history entry for forwarding
    const history = new DocumentHistory({
      documentId: document._id,
      action: 'Forward Document',
      description: `Document forwarded from ${forwardedFrom} to ${forwardTo}`,
      details: {
        forwardedFrom, // Add the previous recipient
        forwardedBy,
        forwardTo,
        remarks,
        documentCopy,
        routePurpose,
        description: `Document forwarded from ${forwardedFrom} to ${forwardTo}` // Add description
      },
      date: forwardedAt
    });
    await history.save();

    res.json(document);
  } catch (error) {
    console.error('Error forwarding document:', error);
    res.status(500).json({ error: 'Failed to forward document' });
  }
});

module.exports = router;
