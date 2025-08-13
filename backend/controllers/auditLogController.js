const AuditLog = require('../models/AuditLog');

// Create an audit log entry
exports.createAuditLog = async (req, res) => {
  try {
    const { action, user, doc, status } = req.body;
    
    if (!action || !user || !doc) {
      return res.status(400).json({ 
        success: false, 
        error: 'Action, user, and doc are required' 
      });
    }

    const log = new AuditLog({
      action,
      user,
      doc,
      status
    });
    
    await log.save();
    res.status(201).json({ 
      success: true, 
      log 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// Get all audit logs
exports.getAllAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    res.json({ 
      success: true, 
      logs 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// Get audit log by ID
exports.getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ 
        success: false, 
        error: 'Audit log not found' 
      });
    }
    res.json({ 
      success: true, 
      log 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// Delete audit log by ID (if needed)
exports.deleteAuditLog = async (req, res) => {
  try {
    const deleted = await AuditLog.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Audit log not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Audit log deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};
