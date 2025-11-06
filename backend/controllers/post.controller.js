import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { Post } from "../models/post.model.js";
import { Reply } from "../models/reply.model.js";
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.utils.js";
import { cloudinaryPostRefer } from "../utils/constants.utils.js";

// *Create a new post
const createPost = asyncHandler(async (req, res, next) => {
    console.log("CreatePost called with body:", req.body);
    console.log("User from JWT:", req.user ? req.user._id : "No user");
    
    const { title, content, category, tags } = req.body;
    
    if (!title || !content) {
        return next(new ErrorHandler("Title and content are required", 400));
    }

    if (!req.user || !req.user._id) {
        console.error("No user found in request");
        return next(new ErrorHandler("Authentication required", 401));
    }

    let media = null;
    
    // Handle file upload if present
    if (req.file) {
        console.log("File received:", req.file.originalname, "Size:", req.file.size);
        try {
            const uploadedMedia = await uploadOnCloudinary(
                req.file.path, 
                cloudinaryPostRefer, 
                req.user, 
                req.file.originalname
            );
            
            if (uploadedMedia) {
                media = {
                    public_id: uploadedMedia.public_id,
                    secure_url: uploadedMedia.secure_url
                };
                console.log("Media uploaded successfully:", media);
            } else {
                console.log("Media upload failed");
            }
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            return next(new ErrorHandler("Failed to upload image", 500));
        }
    }

    // Process tags if provided
    const processedTags = tags ? 
        (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())).slice(0, 10) 
        : [];

    try {
        const post = await Post.create({
            title,
            content,
            author: req.user._id,
            category: category || "general",
            tags: processedTags,
            media
        });

        // Populate author details for response
        await post.populate('author', 'fullName email avatar');

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            post
        });
    } catch (dbError) {
        console.error("Database error:", dbError);
        return next(new ErrorHandler("Failed to create post", 500));
    }
});

// *Get all posts with sorting and pagination
const getAllPosts = asyncHandler(async (req, res, next) => {
    const { 
        sortBy = 'latest', 
        category, 
        page = 1, 
        limit = 10,
        search 
    } = req.query;

    // Build query
    let query = {};
    
    if (category && category !== 'all') {
        query.category = category;
    }
    
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } }
        ];
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
        case 'votes':
            sortOptions = { voteScore: -1, createdAt: -1 };
            break;
        case 'latest':
            sortOptions = { createdAt: -1 };
            break;
        case 'activity':
            sortOptions = { lastActivity: -1 };
            break;
        case 'unanswered':
            query.isAnswered = false;
            sortOptions = { createdAt: -1 };
            break;
        default:
            sortOptions = { createdAt: -1 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get posts with population and pagination
    const posts = await Post.find(query)
        .populate('author', 'fullName email avatar role')
        .populate('answeredBy', 'fullName')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean();

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limitNum);

    res.status(200).json({
        success: true,
        posts,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalPosts,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
        }
    });
});

// *Get single post with replies
const getPostById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Increment views
    await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const post = await Post.findById(id)
        .populate('author', 'fullName email avatar role')
        .populate('answeredBy', 'fullName avatar')
        .populate('upvotes', 'fullName')
        .populate('downvotes', 'fullName');

    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    // Get top-level replies (not nested)
    const replies = await Reply.find({ 
        post: id, 
        parentReply: null,
        isDeleted: false 
    })
    .populate('author', 'fullName email avatar role')
    .populate('upvotes', 'fullName')
    .populate('downvotes', 'fullName')
    .sort({ voteScore: -1, createdAt: 1 })
    .lean();

    // Get nested replies for each top-level reply
    for (let reply of replies) {
        reply.replies = await getNestedReplies(reply._id);
    }

    res.status(200).json({
        success: true,
        post: {
            ...post.toObject(),
            replies
        }
    });
});

// *Helper function to get nested replies
async function getNestedReplies(parentReplyId, depth = 0) {
    if (depth >= 5) return []; // Prevent infinite recursion
    
    const replies = await Reply.find({ 
        parentReply: parentReplyId,
        isDeleted: false 
    })
    .populate('author', 'fullName email avatar role')
    .populate('upvotes', 'fullName')
    .populate('downvotes', 'fullName')
    .sort({ createdAt: 1 })
    .lean();

    for (let reply of replies) {
        reply.replies = await getNestedReplies(reply._id, depth + 1);
    }

    return replies;
}

// *Upvote a post
const upvotePost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    // Check if user already upvoted
    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    if (hasUpvoted) {
        // Remove upvote
        post.upvotes.pull(userId);
    } else {
        // Add upvote and remove downvote if exists
        post.upvotes.push(userId);
        if (hasDownvoted) {
            post.downvotes.pull(userId);
        }
    }

    await post.save();

    res.status(200).json({
        success: true,
        message: hasUpvoted ? "Upvote removed" : "Post upvoted",
        upvotes: post.upvotes.length,
        downvotes: post.downvotes.length,
        voteScore: post.voteScore
    });
});

// *Downvote a post
const downvotePost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    // Check if user already downvoted
    const hasDownvoted = post.downvotes.includes(userId);
    const hasUpvoted = post.upvotes.includes(userId);

    if (hasDownvoted) {
        // Remove downvote
        post.downvotes.pull(userId);
    } else {
        // Add downvote and remove upvote if exists
        post.downvotes.push(userId);
        if (hasUpvoted) {
            post.upvotes.pull(userId);
        }
    }

    await post.save();

    res.status(200).json({
        success: true,
        message: hasDownvoted ? "Downvote removed" : "Post downvoted",
        upvotes: post.upvotes.length,
        downvotes: post.downvotes.length,
        voteScore: post.voteScore
    });
});

// *Mark post as answered (instructor only)
const markPostAsAnswered = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { replyId } = req.body; // The reply that answers the question

    // Check if user is instructor
    if (req.user.role !== 'instructor') {
        return next(new ErrorHandler("Only instructors can mark posts as answered", 403));
    }

    const post = await Post.findById(id);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    // If replyId is provided, mark that reply as accepted answer
    if (replyId) {
        const reply = await Reply.findById(replyId);
        if (!reply) {
            return next(new ErrorHandler("Reply not found", 404));
        }

        // Unset previous accepted answer
        await Reply.updateMany(
            { post: id, isAcceptedAnswer: true },
            { isAcceptedAnswer: false }
        );

        // Set new accepted answer
        reply.isAcceptedAnswer = true;
        await reply.save();
    }

    // Mark post as answered
    post.isAnswered = true;
    post.answeredBy = req.user._id;
    post.answeredAt = new Date();
    await post.save();

    await post.populate('answeredBy', 'fullName avatar');

    res.status(200).json({
        success: true,
        message: "Post marked as answered",
        post
    });
});

// *Update post
const updatePost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;

    const post = await Post.findById(id);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You can only edit your own posts", 403));
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) {
        post.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).slice(0, 10);
    }

    await post.save();
    await post.populate('author', 'fullName email avatar');

    res.status(200).json({
        success: true,
        message: "Post updated successfully",
        post
    });
});

// *Delete post
const deletePost = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    // Check if user is the author or an instructor
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'instructor') {
        return next(new ErrorHandler("You can only delete your own posts", 403));
    }

    // Delete associated media from Cloudinary if exists
    if (post.media && post.media.public_id) {
        await destroyOnCloudinary(post.media.public_id, cloudinaryPostRefer);
    }

    // Delete all replies associated with the post
    await Reply.deleteMany({ post: id });

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: "Post deleted successfully"
    });
});

// *Get posts by category
const getPostsByCategory = asyncHandler(async (req, res, next) => {
    const { category } = req.params;
    const { page = 1, limit = 10, sortBy = 'latest' } = req.query;

    let sortOptions = {};
    switch (sortBy) {
        case 'votes':
            sortOptions = { voteScore: -1, createdAt: -1 };
            break;
        case 'latest':
        default:
            sortOptions = { createdAt: -1 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await Post.find({ category })
        .populate('author', 'fullName email avatar role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

    const totalPosts = await Post.countDocuments({ category });

    res.status(200).json({
        success: true,
        posts,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalPosts / limitNum),
            totalPosts
        }
    });
});

export {
    createPost,
    getAllPosts,
    getPostById,
    upvotePost,
    downvotePost,
    markPostAsAnswered,
    updatePost,
    deletePost,
    getPostsByCategory
};