import mongoose from 'mongoose';
import User from './User.js';

const LetterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
    },
    content: {
        type: String,
        required: [true, 'Please write something'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    senderName: {
        type: String,
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
    },
    stamp: {
        type: String,
        default: 'heart', // heart, rose, butterfly
    },
    paperStyle: {
        type: String,
        default: 'cream', // cream, parchment, grid
    }
}, { timestamps: true });

export default mongoose.models.Letter || mongoose.model('Letter', LetterSchema);
