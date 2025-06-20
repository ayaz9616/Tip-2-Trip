// Tip2Trip
import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { 
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true }
    },
    image: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    tags: [{ type: String }], // For categorizing travel experiences
    experienceType: { 
        type: String, 
        enum: ['adventure', 'cultural', 'food', 'nature', 'urban', 'relaxation', 'other'],
        default: 'other'
    }
}, { timestamps: true });

export const Post = mongoose.model('Post', postSchema);