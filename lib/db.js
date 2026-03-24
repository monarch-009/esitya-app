import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load .env manually for API routes if not populated
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

async function connectDB() {
    // If local instance is connected or connecting, return it.
    if (mongoose.connection.readyState >= 1) {
        return mongoose;
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            bufferCommands: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            family: 4, // Force IPv4 routing to prevent SSL/TLS internal Node.js dropping
        });
        console.log('MongoDB Connected successfully');
        return mongoose;
    } catch (err) {
        console.error('MongoDB Connection error:', err.message);
        throw err;
    }
}

// Model registrations
import Bucket from '../models/Bucket.js';
import Letter from '../models/Letter.js';
import Memory from '../models/Memory.js';
import Post from '../models/Post.js';
import Snap from '../models/Snap.js';
import User from '../models/User.js';

export { Bucket, Letter, Memory, Post, Snap, User };

export default connectDB;
