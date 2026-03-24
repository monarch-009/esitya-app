import mongoose from 'mongoose';

const BucketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedDate: {
        type: Date,
    },
}, { timestamps: true });

export default mongoose.models.Bucket || mongoose.model('Bucket', BucketSchema);
