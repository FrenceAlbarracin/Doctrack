const Document = require('../models/Document');
const DocumentHistory = require('../models/DocumentHistory');

// Create a new document
exports.createDocument = async (req, res) => {
    try {
        const { 
            documentName, 
            serialNumber, 
            recipient, 
            currentLocation, 
            originOffice 
        } = req.body;

        const newDocument = new Document({
            documentName,
            serialNumber,
            recipient,
            currentLocation,
            originOffice,
            dateCreated: new Date(),
            status: 'pending'
        });

        await newDocument.save();
        res.status(201).json(newDocument);
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get all documents with optional filters
exports.getAllDocuments = async (req, res) => {
    try {
        const filters = req.query;
        const documents = await Document.find(filters);
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single document by serial number
exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findOne({ serialNumber: req.params.id });
        if (!document) return res.status(404).json({ error: 'Document not found' });
        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Transfer document to new location
exports.transferDocument = async (req, res) => {
    const { newLocation } = req.body;
    try {
        const document = await Document.findOneAndUpdate(
            { serialNumber: req.params.id },
            { currentLocation: newLocation },
            { new: true }
        );
        if (!document) return res.status(404).json({ error: 'Document not found' });
        res.status(200).json(document);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findOneAndDelete({ serialNumber: req.params.id });
        if (!document) return res.status(404).json({ error: 'Document not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDocumentHistoryById = async (documentId) => {
    try {
        const history = await DocumentHistory.find({ documentId })
            .sort({ date: -1 });
        return history;
    } catch (error) {
        throw error;
    }
};

const getAllDocumentHistory = async ({ dateRange, department, office }) => {
    try {
        let query = {};
        
        if (dateRange) {
            // Add date filtering logic if needed
            query.date = dateRange;
        }
        
        const history = await DocumentHistory.find(query)
            .sort({ date: -1 });
        return history;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    ...module.exports,  // Keep existing exports
    getDocumentHistoryById,
    getAllDocumentHistory
}; 