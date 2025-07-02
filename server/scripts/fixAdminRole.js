import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function fixAdminRole() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await User.findOne({ username: 'admin' });
  if (!admin) {
    console.log('No user with username "admin" found.');
    await mongoose.disconnect();
    process.exit(1);
  }
  admin.role = 'admin';
  await admin.save();
  console.log('Admin user after update:', {
    username: admin.username,
    email: admin.email,
    role: admin.role,
    id: admin._id
  });
  await mongoose.disconnect();
  process.exit(0);
}

fixAdminRole();
