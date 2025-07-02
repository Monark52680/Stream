import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const usersData = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin123',
    role: 'admin',
    isActive: true
  },
  {
    username: 'editor',
    email: 'editor@example.com',
    password: 'Editor123',
    role: 'editor',
    isActive: true
  },
  {
    username: 'user',
    email: 'user@example.com',
    password: 'User123',
    role: 'user',
    isActive: true
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bstream', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    for (const userData of usersData) {
      const user = new User(userData);
      await user.save();
      console.log(`Seeded user: ${user.username} (${user.role})`);
    }

    console.log('User seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
