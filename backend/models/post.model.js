import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        maxlength: [300, "Title cannot be more than 300 characters"],
        trim: true
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        maxlength: [5000, "Content cannot be more than 5000 characters"],
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // For learning context - could be course, subject, or topic
    category: {
        type: String,
        default: "general",
        trim: true
    },
    // Media attachments (images uploaded to Cloudinary)
    media: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    // Mark as resolved/answered by instructor
    isAnswered: {
        type: Boolean,
        default: false
    },
    // Who marked it as answered (usually instructor)
    answeredBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    // When it was marked as answered
    answeredAt: {
        type: Date
    },
    // Upvotes and downvotes for post quality
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    // Track views for popularity/engagement
    views: {
        type: Number,
        default: 0
    },
    // For search and filtering
    tags: [{
        type: String,
        trim: true
    }],
    // Auto-calculate vote score for sorting
    voteScore: {
        type: Number,
        default: 0
    },
    // Track last activity for sorting
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware to update voteScore and lastActivity
postSchema.pre('save', function(next) {
    this.voteScore = this.upvotes.length - this.downvotes.length;
    this.lastActivity = new Date();
    next();
});

// Index for better performance on common queries
postSchema.index({ voteScore: -1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ isAnswered: 1, createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);