import mongoose from 'mongoose';
import User from './User.js';

const MemorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    date: {
        type: Date,
        required: [true, 'Please provide a date'],
    },
    image: {
        type: String,
    },
    location: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

export default mongoose.models.Memory || mongoose.model('Memory', MemorySchema);
