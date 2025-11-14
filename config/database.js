import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not set in .env file');
      console.error('   Please add MONGODB_URI to your .env file');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if MONGODB_URI is set in .env file');
    console.error('   2. Verify MongoDB connection string is correct');
    console.error('   3. For MongoDB Atlas, ensure IP is whitelisted');
    console.error('   4. For local MongoDB, ensure service is running');
    process.exit(1);
  }
};

export default connectDB;

