const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

// Get approval status for a document
router.get('/:documentId/approvals', async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    res.json({ 
      success: true, 
      approvals: document.approvals,
      approvalFlow: document.approvalFlow,
      currentLevel: document.approvalFlow.currentLevel
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Submit approval/sign-off
router.post('/:documentId/approve', async (req, res) => {
  try {
    const { user, role, status, comment, signature } = req.body;
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    // Check if user has already approved
    const existingApproval = document.approvals.find(a => a.approver === user);
    if (existingApproval) {
      return res.status(400).json({ 
        success: false, 
        error: 'User has already submitted approval for this document' 
      });
    }

    // Create digital signature hash
    const signatureHash = crypto.createHash('sha256')
      .update(`${user}${document._id}${Date.now()}`)
      .digest('hex');

    const approval = {
      approver: user,
      role,
      status,
      comment,
      timestamp: new Date(),
      signature: signatureHash
    };

    document.approvals.push(approval);

    // Update approval flow
    if (document.approvalFlow.type === 'multi') {
      document.approvalFlow.currentLevel += 1;
    }

    await document.save();

    // Create audit log
    await new AuditLog({
      action: status === 'approved' ? 'Approve' : 'Reject',
      user,
      doc: document.title,
      actionType: status === 'approved' ? 'approve' : 'reject',
      documentId: document._id,
      details: {
        approvalLevel: document.approvalFlow.currentLevel,
        field: 'approval',
        newValue: status,
        shareToken: signatureHash
      }
    }).save();

    res.json({ 
      success: true, 
      message: `Document ${status} by ${user}`,
      approval,
      currentLevel: document.approvalFlow.currentLevel
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Set up approval flow for a document
router.post('/:documentId/setup-approval', async (req, res) => {
  try {
    const { type, levels, user } = req.body;
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    document.approvalFlow = {
      type,
      levels: levels || [],
      currentLevel: 0
    };

    await document.save();

    // Create audit log
    await new AuditLog({
      action: 'Setup Approval Flow',
      user,
      doc: document.title,
      actionType: 'status_change',
      documentId: document._id,
      details: {
        field: 'approvalFlow',
        newValue: type
      }
    }).save();

    res.json({ 
      success: true, 
      message: 'Approval flow set up successfully',
      approvalFlow: document.approvalFlow
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get documents pending approval for a user
router.get('/pending/:userRole', async (req, res) => {
  try {
    const documents = await Document.find({
      'approvalFlow.currentLevel': { $gte: 0 },
      'approvals.approver': { $ne: req.params.userRole }
    });

    const pendingDocs = documents.filter(doc => {
      const currentLevel = doc.approvalFlow.levels[doc.approvalFlow.currentLevel];
      return currentLevel && currentLevel.role === req.params.userRole;
    });

    res.json({ 
      success: true, 
      documents: pendingDocs
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Verify digital signature
router.post('/verify-signature', async (req, res) => {
  try {
    const { documentId, user, signature } = req.body;
    const document = await Document.findById(documentId);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    const approval = document.approvals.find(a => a.approver === user && a.signature === signature);
    
    if (!approval) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid signature or approval not found' 
      });
    }

    res.json({ 
      success: true, 
      isValid: true,
      approval
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router; 