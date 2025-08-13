const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// CREATE
router.post('/', documentController.createDocument);

// READ
router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);

// UPDATE
router.put('/:id', documentController.updateDocument);

// DELETE
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
