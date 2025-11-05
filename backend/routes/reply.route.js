import { Router } from "express";
import { 
    createReply, 
    getRepliesByPost, 
    upvoteReply, 
    downvoteReply, 
    markReplyAsAccepted, 
    updateReply, 
    deleteReply, 
    getUserReplies 
} from "../controllers/reply.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/post/:id", getRepliesByPost);
router.get("/user/:userId", getUserReplies);

// Protected routes
router.post("/post/:id", verifyJWT, createReply);
router.post("/:replyId/upvote", verifyJWT, upvoteReply);
router.post("/:replyId/downvote", verifyJWT, downvoteReply);
router.patch("/:replyId/accept", verifyJWT, markReplyAsAccepted); //*not checked    
router.put("/:replyId", verifyJWT, updateReply);
router.delete("/:replyId", verifyJWT, deleteReply);

export default router;