const mongoose = require('mongoose');
require('dotenv').config();

const fixDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/document_management", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB Atlas');

    // Get the database
    const db = mongoose.connection.db;
    
    // Drop the problematic email index from users collection
    try {
      await db.collection('users').dropIndex('email_1');
      console.log('Successfully dropped email index');
    } catch (error) {
      console.log('Email index not found or already dropped:', error.message);
    }

    // Create a new user to test
    const User = require('../models/User');
    const bcrypt = require('bcrypt');
    
    try {
      const testUser = new User({
        username: 'teststaff',
        password: await bcrypt.hash('testpass123', 10),
        role: 'Staff'
      });
      
      await testUser.save();
      console.log('Successfully created test user: teststaff');
    } catch (error) {
      console.log('Error creating test user:', error.message);
    }

    console.log('Database fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
};

fixDatabase(); 