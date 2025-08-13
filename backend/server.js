const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Import routes
const userRoutes = require('./routes/userRoute');
const documentRoutes = require('./routes/documentRoute');
const auditLogRoutes = require('./routes/auditLogRoutes');
const versionRoutes = require('./routes/versionRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const shareRoutes = require('./routes/shareRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/share', shareRoutes);

// Login endpoint for backward compatibility
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const User = require('./models/User');
    const bcrypt = require('bcrypt');
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    res.json({ 
      success: true, 
      user: { 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Dashboard stats endpoint
app.get("/api/dashboard-stats", async (req, res) => {
  try {
    const Document = require('./models/Document');
    const User = require('./models/User');
    
    const documentCount = await Document.countDocuments();
    const userCount = await User.countDocuments();
    
    const documents = await Document.find();
    const documentsByCategory = documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {});

    const recentUploads = await Document.find()
      .sort({ uploadedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        documentCount,
        userCount,
        documentsByCategory,
        recentUploads,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Backend is working!" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/document_management", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
}); 