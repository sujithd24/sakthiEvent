const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  by: { type: String, required: true },
  changes: {
    title: { type: String },
    category: { type: String },
    description: { type: String },
    status: { type: String },
    tags: [String],
    content: { type: String }, // For text-based documents
    file: { type: String } // For file-based documents
  },
  previousVersion: { type: Number },
  changeSummary: { type: String }
});

const approvalSchema = new mongoose.Schema({
  approver: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  comment: { type: String },
  timestamp: { type: Date, default: Date.now },
  signature: { type: String } // Digital signature hash
});

const shareableLinkSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  accessLevel: { type: String, enum: ['view', 'download'], default: 'view' },
  expiresAt: { type: Date },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  file: String,
  status: { type: String, default: 'active' },
  logs: [String],
  tags: [String], // Dynamic tagging system
  currentVersion: { type: Number, default: 1 },
  versions: [versionSchema],
  approvals: [approvalSchema],
  approvalFlow: {
    type: { type: String, enum: ['single', 'multi'], default: 'single' },
    levels: [{
      role: { type: String, required: true },
      order: { type: Number, required: true }
    }],
    currentLevel: { type: Number, default: 0 }
  },
  shareableLinks: [shareableLinkSchema],
  isPublic: { type: Boolean, default: false },
  lastModified: { type: Date, default: Date.now },
  lastModifiedBy: { type: String }
});

// Pre-save middleware to handle versioning
documentSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('description') || 
      this.isModified('category') || this.isModified('status') || 
      this.isModified('tags') || this.isModified('file')) {
    
    this.lastModified = new Date();
    this.lastModifiedBy = this.uploadedBy; // This should be updated with actual current user
    
    // Create new version if this is an update
    if (this.versions.length > 0) {
      const newVersion = {
        version: this.currentVersion + 1,
        date: new Date(),
        by: this.lastModifiedBy,
        changes: {
          title: this.title,
          category: this.category,
          description: this.description,
          status: this.status,
          tags: this.tags,
          file: this.file
        },
        previousVersion: this.currentVersion,
        changeSummary: `Updated by ${this.lastModifiedBy}`
      };
      
      this.versions.push(newVersion);
      this.currentVersion = newVersion.version;
    }
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema); 