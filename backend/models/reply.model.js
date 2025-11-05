import mongoose, { Schema } from "mongoose";

const replySchema = new Schema({
    content: {
        type: String,
        required: [true, "Reply content is required"],
        maxlength: [2000, "Reply cannot be more than 2000 characters"],
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    // For threaded replies - null if it's a direct reply to post
    parentReply: {
        type: Schema.Types.ObjectId,
        ref: "Reply",
        default: null
    },
    // Mark if this is the accepted answer
    isAcceptedAnswer: {
        type: Boolean,
        default: false
    },
    // Track if author is instructor (for UI differentiation)
    isInstructorReply: {
        type: Boolean,
        default: false
    },
    // Upvotes and downvotes for reply quality
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    // Auto-calculate vote score
    voteScore: {
        type: Number,
        default: 0
    },
    // For nested replies
    depth: {
        type: Number,
        default: 0,
        max: 5 // Limit nesting depth to prevent abuse
    },
    // Soft delete for moderation
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

// Middleware to update voteScore
replySchema.pre('save', function(next) {
    this.voteScore = this.upvotes.length - this.downvotes.length;
    
    // Auto-detect if author is instructor (you might want to adjust this logic)
    // This is a simple implementation - you might want to check user role instead
    if (this.author && this.author.role === 'instructor') {
        this.isInstructorReply = true;
    }
    
    next();
});

// Update post's lastActivity when reply is created/updated
replySchema.post('save', async function() {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(this.post, { 
        lastActivity: new Date() 
    });
});

// Indexes for performance
replySchema.index({ post: 1, createdAt: 1 });
replySchema.index({ post: 1, voteScore: -1 });
replySchema.index({ parentReply: 1 });
replySchema.index({ author: 1, createdAt: -1 });
replySchema.index({ isAcceptedAnswer: 1 });

export const Reply = mongoose.model("Reply", replySchema);