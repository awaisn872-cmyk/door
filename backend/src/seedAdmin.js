import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import { connectDatabase } from './config/database.js';

if (!process.env.MONGODB_URI || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.error('Configure MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env');
  process.exit(1);
}

if (process.env.ADMIN_PASSWORD.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters.');
  process.exit(1);
}

try {
  await connectDatabase();

  const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
  let user = await User.findOne({ email }).select('+password');

  if (user && user.role !== 'admin') {
    console.error('That email already belongs to a non-admin user. Choose a different ADMIN_EMAIL.');
    await mongoose.disconnect();
    process.exit(1);
  }

  if (user) {
    console.log(`Admin account already exists: ${email}`);
  } else {
    user = await User.create({
      name: process.env.ADMIN_NAME || 'DoorDash Administrator',
      email,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      role: 'admin',
      active: true
    });
    console.log(`Admin created successfully: ${user.email}`);
  }

  await mongoose.disconnect();
  console.log('Admin seeding completed.');
  process.exit(0);
} catch (err) {
  console.error('Failed to seed admin account:', err.message);
  process.exit(1);
}
