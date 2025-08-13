const User = require('../models/User');

// Middleware to check if user is authenticated
const authenticateUser = async (req, res, next) => {
  try {
    // For now, we'll use a simple approach with username in headers
    // In a production app, you'd use JWT tokens
    const username = req.headers['x-user'];
    const role = req.headers['x-role'];
    
    if (!username || !role) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Authentication error' 
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }
  next();
};

// Middleware to check if user is staff or admin
const requireStaff = (req, res, next) => {
  if (!req.user || (req.user.role !== 'Admin' && req.user.role !== 'Staff')) {
    return res.status(403).json({ 
      success: false, 
      error: 'Staff or Admin access required' 
    });
  }
  next();
};

module.exports = {
  authenticateUser,
  requireAdmin,
  requireStaff
}; 