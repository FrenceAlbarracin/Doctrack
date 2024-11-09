const express = require('express');
const app = express();
const cors = require('cors');
const documentRoutes = require('./routes/document');

app.use(cors());
app.use(express.json());

// Mount the document routes
app.use('/api/documents', documentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: err.message });
});
