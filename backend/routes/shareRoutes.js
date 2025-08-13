const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

// Generate shareable link
router.post('/:documentId/share', async (req, res) => {
  try {
    const { accessLevel, expiresAt, createdBy } = req.body;
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    const shareableLink = {
      token,
      accessLevel: accessLevel || 'view',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy,
      createdAt: new Date(),
      isActive: true
    };

    document.shareableLinks.push(shareableLink);
    await document.save();

    // Create audit log
    await new AuditLog({
      action: 'Share Document',
      user: createdBy,
      doc: document.title,
      actionType: 'share',
      documentId: document._id,
      details: {
        shareToken: token,
        field: 'shareableLink',
        newValue: accessLevel
      }
    }).save();

    const shareUrl = `${req.protocol}://${req.get('host')}/shared/${token}`;

    res.json({ 
      success: true, 
      message: 'Shareable link created successfully',
      shareUrl,
      token,
      expiresAt: shareableLink.expiresAt
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Access shared document
router.get('/shared/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const document = await Document.findOne({
      'shareableLinks.token': token,
      'shareableLinks.isActive': true
    });

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Shared link not found or inactive' 
      });
    }

    const shareableLink = document.shareableLinks.find(link => link.token === token);
    
    // Check if link has expired
    if (shareableLink.expiresAt && new Date() > shareableLink.expiresAt) {
      return res.status(410).json({ 
        success: false, 
        error: 'Shareable link has expired' 
      });
    }

    // Create audit log for access
    await new AuditLog({
      action: 'Access Shared Document',
      user: 'Anonymous',
      doc: document.title,
      actionType: 'view',
      documentId: document._id,
      details: {
        shareToken: token,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    }).save();

    res.json({ 
      success: true, 
      document: {
        title: document.title,
        description: document.description,
        category: document.category,
        uploadedBy: document.uploadedBy,
        uploadedAt: document.uploadedAt,
        file: shareableLink.accessLevel === 'download' ? document.file : null,
        accessLevel: shareableLink.accessLevel,
        expiresAt: shareableLink.expiresAt
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get all shareable links for a document
router.get('/:documentId/links', async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    // Filter out expired links
    const activeLinks = document.shareableLinks.filter(link => {
      if (!link.isActive) return false;
      if (link.expiresAt && new Date() > link.expiresAt) return false;
      return true;
    });

    res.json({ 
      success: true, 
      links: activeLinks
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Deactivate shareable link
router.delete('/:documentId/links/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { user } = req.body;
    
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    const linkIndex = document.shareableLinks.findIndex(link => link.token === token);
    if (linkIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Shareable link not found' 
      });
    }

    document.shareableLinks[linkIndex].isActive = false;
    await document.save();

    // Create audit log
    await new AuditLog({
      action: 'Deactivate Share Link',
      user,
      doc: document.title,
      actionType: 'share',
      documentId: document._id,
      details: {
        shareToken: token,
        field: 'shareableLink',
        oldValue: 'active',
        newValue: 'inactive'
      }
    }).save();

    res.json({ 
      success: true, 
      message: 'Shareable link deactivated successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Update document visibility (public/private)
router.patch('/:documentId/visibility', async (req, res) => {
  try {
    const { isPublic, user } = req.body;
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    document.isPublic = isPublic;
    await document.save();

    // Create audit log
    await new AuditLog({
      action: `Make Document ${isPublic ? 'Public' : 'Private'}`,
      user,
      doc: document.title,
      actionType: 'status_change',
      documentId: document._id,
      details: {
        field: 'visibility',
        oldValue: !isPublic ? 'public' : 'private',
        newValue: isPublic ? 'public' : 'private'
      }
    }).save();

    res.json({ 
      success: true, 
      message: `Document made ${isPublic ? 'public' : 'private'}`,
      isPublic: document.isPublic
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router; 