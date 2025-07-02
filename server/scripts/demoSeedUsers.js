// DEMO-ONLY: Simple user seeding script (no validation, no hashing)
import mongoose from 'mongoose';
import User from '../models/User.js';

const usersData = [
  { username: 'admin', email: 'admin@example.com', password: 'Admin123', role: 'admin', isActive: true },
  { username: 'editor', email: 'editor@example.com', password: 'Editor123', role: 'editor', isActive: true },
  { username: 'user', email: 'user@example.com', password: 'User123', role: 'user', isActive: true }
];

async function seedUsers() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bstream');
  await User.deleteMany({});
  for (const userData of usersData) {
    // For demo: store password as plain text (bcrypt will hash on save)
    const user = new User(userData);
    await user.save();
    console.log(`Seeded user: ${user.username}`);
  }
  console.log('Demo users seeded!');
  process.exit(0);
}

seedUsers();
