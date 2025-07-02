import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('Admin user already exists:', existing.username);
      await mongoose.disconnect();
      process.exit(0);
    }
    const admin = new User({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isActive: true
    });
    await admin.save();
    console.log('Admin user created:', admin.username);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdminUser();
