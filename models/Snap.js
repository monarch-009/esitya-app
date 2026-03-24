import mongoose from 'mongoose';
import User from './User.js';

const SnapCommentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const SnapSchema = new mongoose.Schema({
    caption: {
        type: String,
        default: ''
    },
    mediaUrl: {
        type: String,
        default: ''
    },
    platform: {
        type: String,
        default: 'custom'
    },
    mediaType: {
        type: String,
        enum: ['image', 'video', 'none'],
        default: 'none'
    },
    isMirrored: {
        type: Boolean,
        default: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [SnapCommentSchema]
}, { timestamps: true });

export default mongoose.models.Snap || mongoose.model('Snap', SnapSchema);
