const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');

// Create a document
exports.createDocument = async (req, res) => {
  try {
    const { title, category, description, uploadedBy, file, status, logs, tags, shareableLinks } = req.body;

    console.log("Incoming request data:", req.body);

    // Validate required fields
    if (!title || !category || !uploadedBy) {
      return res.status(400).json({
        success: false,
        error: 'Title, category, and uploadedBy are required'
      });
    }

    // Prepare shareableLinks safely (remove null tokens)
    let safeShareableLinks = [];
    if (Array.isArray(shareableLinks)) {
      safeShareableLinks = shareableLinks
        .filter(link => link && link.token) // keep only ones with valid token
        .map(link => ({
          token: link.token,
          accessLevel: link.accessLevel || 'view',
          expiresAt: link.expiresAt || null,
          createdBy: uploadedBy,
          isActive: link.isActive ?? true
        }));
    }

    // Create the document
    const document = new Document({
      title,
      category,
      description,
      uploadedBy,
      file,
      status: status || 'active',
      logs: Array.isArray(logs) ? logs : (logs ? [logs] : []),
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      currentVersion: 1,
      versions: [
        {
          version: 1,
          date: new Date(),
          by: uploadedBy,
          changes: {
            title,
            category,
            description,
            status: status || 'active',
            tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
            file
          },
          changeSummary: 'Initial version'
        }
      ],
      shareableLinks: safeShareableLinks
    });

    console.log("Saving document to MongoDB...");
    await document.save();
    console.log("Document saved successfully with ID:", document._id);

    // Create audit log
    await new AuditLog({
      action: 'Upload',
      user: uploadedBy,
      doc: title,
      status: document.status
    }).save();

    console.log("Audit log created successfully.");

    res.status(201).json({
      success: true,
      document
    });

  } catch (err) {
    console.error("Error creating document:", err);
    if (err.name === 'ValidationError') {
      Object.keys(err.errors).forEach(field => {
        console.error(`Validation error in "${field}":`, err.errors[field].message);
      });
    }
    res.status(400).json({
      success: false,
      error: err.message,
      details: err.errors || {}
    });
  }
};

// Get all documents
exports.getAllDocuments = async (req, res) => {
  try {
    const { tags, category, status, search } = req.query;
    let query = {};

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(query).sort({ uploadedAt: -1 });
    res.json({ 
      success: true, 
      documents 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }
    res.json({ 
      success: true, 
      document 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// Update document by ID
exports.updateDocument = async (req, res) => {
  try {
    const { title, category, description, status, logs, user } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (logs !== undefined) updateData.logs = Array.isArray(logs) ? logs : (logs ? [logs] : []);

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Create audit log
    await new AuditLog({
      action: 'Edit',
      user: user || 'Unknown',
      doc: document.title,
      status: updatedDocument.status
    }).save();

    res.json({ 
      success: true, 
      document: updatedDocument 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// Delete document by ID
exports.deleteDocument = async (req, res) => {
  try {
    const { role, user } = req.query;
    
    if (role !== "Admin") {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can delete documents' 
      });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found' 
      });
    }

    await Document.findByIdAndDelete(req.params.id);

    // Create audit log
    await new AuditLog({
      action: 'Delete',
      user: user || 'Admin',
      doc: document.title,
      status: document.status
    }).save();

    res.json({ 
      success: true, 
      message: 'Document deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};
