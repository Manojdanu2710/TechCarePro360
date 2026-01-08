import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = (process.env.ADMIN_EMAIL || 'admin@techcare.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('Creating admin with email:', email);

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists:', email);
      console.log('If you want to reset the password, delete the admin from the database first.');
      process.exit(0);
    }

    // Create admin - password will be hashed by the pre-save hook in the model
    const admin = await Admin.create({
      email: email.toLowerCase().trim(),
      password: password // Will be hashed automatically by Admin model pre-save hook
    });

    console.log('\n✅ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Please change the default password after first login!');
    console.log('⚠️  Make sure JWT_SECRET is set in your .env file!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('Email already exists in database.');
    }
    console.error('Full error:', error);
    process.exit(1);
  }
};

createAdmin();

