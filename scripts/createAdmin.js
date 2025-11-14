import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Admin from '../models/Admin.js';
import connectDB from '../config/database.js';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (two levels up from scripts directory)
dotenv.config({ path: join(__dirname, '../../.env') });

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get credentials from command line arguments or use defaults
    const username = process.argv[2] || 'admin';
    const email = process.argv[3] || 'admin@pankhokiudaan.org';
    const password = process.argv[4] || 'admin123';
    const role = process.argv[5] || 'admin';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingAdmin) {
      console.log('❌ Admin already exists with this username or email');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      process.exit(1);
    }

    // Create new admin
    const admin = new Admin({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role,
    });

    await admin.save();

    console.log('✅ Admin created successfully!');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n📝 You can now login with these credentials');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('   Validation errors:', messages.join(', '));
    }
    
    process.exit(1);
  }
};

// Run the script
createAdmin();

