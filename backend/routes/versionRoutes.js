const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');

// Get all versions of a document
router.get('/:documentId/versions', async (req, res) => {
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
      versions: document.versions.sort((a, b) => b.version - a.version),
      currentVersion: document.currentVersion
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get specific version of a document
router.get('/:documentId/versions/:versionNumber', async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    const version = document.versions.find(v => v.version === parseInt(req.params.versionNumber));
    if (!version) {
      return res.status(404).json({ 
        success: false, 
        error: 'Version not found' 
      });
    }

    res.json({ 
      success: true, 
      version 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Compare two versions (diff viewer)
router.get('/:documentId/compare/:version1/:version2', async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    const version1 = document.versions.find(v => v.version === parseInt(req.params.version1));
    const version2 = document.versions.find(v => v.version === parseInt(req.params.version2));

    if (!version1 || !version2) {
      return res.status(404).json({ 
        success: false, 
        error: 'One or both versions not found' 
      });
    }

    // Simple diff calculation for text fields
    const diff = {
      title: version1.changes.title !== version2.changes.title ? {
        old: version1.changes.title,
        new: version2.changes.title
      } : null,
      description: version1.changes.description !== version2.changes.description ? {
        old: version1.changes.description,
        new: version2.changes.description
      } : null,
      category: version1.changes.category !== version2.changes.category ? {
        old: version1.changes.category,
        new: version2.changes.category
      } : null,
      status: version1.changes.status !== version2.changes.status ? {
        old: version1.changes.status,
        new: version2.changes.status
      } : null,
      tags: JSON.stringify(version1.changes.tags) !== JSON.stringify(version2.changes.tags) ? {
        old: version1.changes.tags,
        new: version2.changes.tags
      } : null
    };

    res.json({ 
      success: true, 
      diff,
      version1: {
        version: version1.version,
        date: version1.date,
        by: version1.by
      },
      version2: {
        version: version2.version,
        date: version2.date,
        by: version2.by
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Revert to a specific version
router.post('/:documentId/revert/:versionNumber', async (req, res) => {
  try {
    const { user } = req.body;
    const document = await Document.findById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    const targetVersion = document.versions.find(v => v.version === parseInt(req.params.versionNumber));
    if (!targetVersion) {
      return res.status(404).json({ 
        success: false, 
        error: 'Version not found' 
      });
    }

    // Revert document to target version
    document.title = targetVersion.changes.title;
    document.description = targetVersion.changes.description;
    document.category = targetVersion.changes.category;
    document.status = targetVersion.changes.status;
    document.tags = targetVersion.changes.tags;
    document.lastModified = new Date();
    document.lastModifiedBy = user;

    await document.save();

    // Create audit log
    await new AuditLog({
      action: 'Revert',
      user,
      doc: document.title,
      actionType: 'version',
      documentId: document._id,
      details: {
        version: targetVersion.version,
        field: 'revert',
        oldValue: document.currentVersion.toString(),
        newValue: targetVersion.version.toString()
      }
    }).save();

    res.json({ 
      success: true, 
      message: `Document reverted to version ${targetVersion.version}`,
      document
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router; 