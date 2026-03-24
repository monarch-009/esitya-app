import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: 60,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    profileImage: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        default: 'user',
    },
    pushSubscriptions: {
        type: Array,
        default: [],
    },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
