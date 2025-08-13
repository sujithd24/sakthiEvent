const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');

// CREATE
router.post('/', auditLogController.createAuditLog);

// READ
router.get('/', auditLogController.getAllAuditLogs);
router.get('/:id', auditLogController.getAuditLogById);

// DELETE
router.delete('/:id', auditLogController.deleteAuditLog);

module.exports = router;
