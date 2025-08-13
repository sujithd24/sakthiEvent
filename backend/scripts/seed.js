const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/document_management", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB Atlas');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create initial users
    const users = [
      {
        username: 'admin',
        password: await bcrypt.hash('admin', 10),
        role: 'Admin'
      },
      {
        username: 'staff',
        password: await bcrypt.hash('staff', 10),
        role: 'Staff'
      },
      {
        username: 'viewer',
        password: await bcrypt.hash('viewer', 10),
        role: 'Viewer'
      }
    ];

    // Insert users one by one to avoid bulk insert issues
    for (const user of users) {
      try {
        await User.create(user);
        console.log(`Created user: ${user.username}`);
      } catch (error) {
        console.log(`Error creating user ${user.username}:`, error.message);
      }
    }

    console.log('Database seeding completed!');
    console.log('Default users created:');
    console.log('- admin/admin (Admin)');
    console.log('- staff/staff (Staff)');
    console.log('- viewer/viewer (Viewer)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers(); 