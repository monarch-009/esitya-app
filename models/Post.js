import mongoose from 'mongoose';
import User from './User.js';

const CommentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
    caption: {
        type: String,
        default: ''
    },
    mediaUrl: {
        type: String,
        default: ''
    },
    originalLink: {
        type: String,
        default: ''
    },
    platform: {
        type: String,
        enum: ['youtube', 'instagram', 'twitter', 'custom', 'none'],
        default: 'none'
    },
    mediaType: {
        type: String,
        enum: ['image', 'video', 'none'],
        default: 'none'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
    isSnap: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
