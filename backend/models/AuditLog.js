const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  doc: { type: String, required: true },
  status: String,
  // Advanced audit trail fields
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  actionType: { 
    type: String, 
    enum: ['create', 'update', 'delete', 'view', 'download', 'approve', 'reject', 'sign', 'share', 'version', 'tag', 'status_change'],
    
  },
  details: {
    field: String, // Which field was changed
    oldValue: String, // Previous value
    newValue: String, // New value
    version: Number, // Version number if applicable
    approvalLevel: Number, // Approval level if applicable
    shareToken: String, // Share token if applicable
    ipAddress: String, // IP address of the action
    userAgent: String // User agent string
  },
  metadata: {
    sessionId: String,
    requestId: String,
    duration: Number // Time taken for the action
  }
});

// Index for better query performance
auditLogSchema.index({ actionType: 1, timestamp: -1 });
auditLogSchema.index({ documentId: 1, timestamp: -1 });
auditLogSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema); 