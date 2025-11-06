import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { Reply } from "../models/reply.model.js";
import { Post } from "../models/post.model.js";

// *Create a reply
const createReply = asyncHandler(async (req, res, next) => {
    const { id: postId } = req.params;
    const { content, parentReply } = req.body;

    if (!content || content.trim() === '') {
        return next(new ErrorHandler("Reply content is required", 400));
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    let depth = 0;
    
    // If this is a reply to another reply, calculate depth
    if (parentReply) {
        const parent = await Reply.findById(parentReply);
        if (!parent) {
            return next(new ErrorHandler("Parent reply not found", 404));
        }
        depth = parent.depth + 1;
        
        // Limit nesting depth
        if (depth > 5) {
            return next(new ErrorHandler("Maximum nesting depth reached", 400));
        }
    }

    const reply = await Reply.create({
        content: content.trim(),
        author: req.user._id,
        post: postId,
        parentReply: parentReply || null,
        depth,
        isInstructorReply: req.user.role === 'instructor'
    });

    // Populate author details
    await reply.populate('author', 'fullName email avatar role');

    // Update post's lastActivity and increment replyCount
    await Post.findByIdAndUpdate(postId, { 
        lastActivity: new Date(),
        $inc: { replyCount: 1 }
    });

    res.status(201).json({
        success: true,
        message: "Reply added successfully",
        reply
    });
});

// *Get replies for a post
const getRepliesByPost = asyncHandler(async (req, res, next) => {
    const { id: postId } = req.params;
    const { parentReply = null } = req.query;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    let replies;
    
    if (parentReply) {
        // Get nested replies for a specific parent
        replies = await Reply.find({ 
            post: postId, 
            parentReply,
            isDeleted: false 
        })
        .populate('author', 'fullName email avatar role')
        .populate('upvotes', 'fullName')
        .populate('downvotes', 'fullName')
        .sort({ createdAt: 1 });
    } else {
        // Get top-level replies
        replies = await Reply.find({ 
            post: postId, 
            parentReply: null,
            isDeleted: false 
        })
        .populate('author', 'fullName email avatar role')
        .populate('upvotes', 'fullName')
        .populate('downvotes', 'fullName')
        .sort({ voteScore: -1, createdAt: 1 });
    }

    res.status(200).json({
        success: true,
        replies
    });
});

// *Upvote a reply
const upvoteReply = asyncHandler(async (req, res, next) => {
    const { replyId } = req.params;
    const userId = req.user._id;

    const reply = await Reply.findById(replyId);
    if (!reply) {
        return next(new ErrorHandler("Reply not found", 404));
    }

    // Check if user already upvoted
    const hasUpvoted = reply.upvotes.includes(userId);
    const hasDownvoted = reply.downvotes.includes(userId);

    if (hasUpvoted) {
        // Remove upvote
        reply.upvotes.pull(userId);
    } else {
        // Add upvote and remove downvote if exists
        reply.upvotes.push(userId);
        if (hasDownvoted) {
            reply.downvotes.pull(userId);
        }
    }

    await reply.save();

    // Update post's lastActivity
    await Post.findByIdAndUpdate(reply.post, { lastActivity: new Date() });

    res.status(200).json({
        success: true,
        message: hasUpvoted ? "Upvote removed" : "Reply upvoted",
        upvotes: reply.upvotes.length,
        downvotes: reply.downvotes.length,
        voteScore: reply.voteScore
    });
});

// *Downvote a reply
const downvoteReply = asyncHandler(async (req, res, next) => {
    const { replyId } = req.params;
    const userId = req.user._id;

    const reply = await Reply.findById(replyId);
    if (!reply) {
        return next(new ErrorHandler("Reply not found", 404));
    }

    // Check if user already downvoted
    const hasDownvoted = reply.downvotes.includes(userId);
    const hasUpvoted = reply.upvotes.includes(userId);

    if (hasDownvoted) {
        // Remove downvote
        reply.downvotes.pull(userId);
    } else {
        // Add downvote and remove upvote if exists
        reply.downvotes.push(userId);
        if (hasUpvoted) {
            reply.upvotes.pull(userId);
        }
    }

    await reply.save();

    // Update post's lastActivity
    await Post.findByIdAndUpdate(reply.post, { lastActivity: new Date() });

    res.status(200).json({
        success: true,
        message: hasDownvoted ? "Downvote removed" : "Reply downvoted",
        upvotes: reply.upvotes.length,
        downvotes: reply.downvotes.length,
        voteScore: reply.voteScore
    });
});

// *Mark reply as accepted answer (instructor only)
const markReplyAsAccepted = asyncHandler(async (req, res, next) => {
    const { replyId } = req.params;

    // Check if user is instructor
    if (req.user.role !== 'instructor') {
        return next(new ErrorHandler("Only instructors can mark replies as accepted", 403));
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
        return next(new ErrorHandler("Reply not found", 404));
    }

    // Unset previous accepted answer for this post
    await Reply.updateMany(
        { post: reply.post, isAcceptedAnswer: true },
        { isAcceptedAnswer: false }
    );

    // Set this reply as accepted answer
    reply.isAcceptedAnswer = true;
    await reply.save();

    // Also mark the post as answered
    await Post.findByIdAndUpdate(reply.post, {
        isAnswered: true,
        answeredBy: req.user._id,
        answeredAt: new Date()
    });

    await reply.populate('author', 'fullName email avatar role');

    res.status(200).json({
        success: true,
        message: "Reply marked as accepted answer",
        reply
    });
});

// *Update reply
const updateReply = asyncHandler(async (req, res, next) => {
    const { replyId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return next(new ErrorHandler("Reply content is required", 400));
    }

    const reply = await Reply.findById(replyId);
    if (!reply) {
        return next(new ErrorHandler("Reply not found", 404));
    }

    // Check if user is the author
    if (reply.author.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You can only edit your own replies", 403));
    }

    // Update content
    reply.content = content.trim();
    await reply.save();

    // Update post's lastActivity
    await Post.findByIdAndUpdate(reply.post, { lastActivity: new Date() });

    await reply.populate('author', 'fullName email avatar role');

    res.status(200).json({
        success: true,
        message: "Reply updated successfully",
        reply
    });
});

// *Delete reply (soft delete)
const deleteReply = asyncHandler(async (req, res, next) => {
    const { replyId } = req.params;

    const reply = await Reply.findById(replyId);
    if (!reply) {
        return next(new ErrorHandler("Reply not found", 404));
    }

    // Check if user is the author or an instructor
    if (reply.author.toString() !== req.user._id.toString() && req.user.role !== 'instructor') {
        return next(new ErrorHandler("You can only delete your own replies", 403));
    }

    // Soft delete
    reply.isDeleted = true;
    reply.deletedAt = new Date();
    reply.deletedBy = req.user._id;
    await reply.save();

    // Update post's lastActivity and decrement replyCount
    await Post.findByIdAndUpdate(reply.post, { 
        lastActivity: new Date(),
        $inc: { replyCount: -1 }
    });

    res.status(200).json({
        success: true,
        message: "Reply deleted successfully"
    });
});

// *Get user's replies
const getUserReplies = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const replies = await Reply.find({ 
        author: userId,
        isDeleted: false 
    })
    .populate('post', 'title')
    .populate('author', 'fullName email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

    const totalReplies = await Reply.countDocuments({ 
        author: userId,
        isDeleted: false 
    });

    res.status(200).json({
        success: true,
        replies,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalReplies / limitNum),
            totalReplies
        }
    });
});

export {
    createReply,
    getRepliesByPost,
    upvoteReply,
    downvoteReply,
    markReplyAsAccepted,
    updateReply,
    deleteReply,
    getUserReplies
};