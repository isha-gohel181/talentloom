import { Router } from "express";
import { 
    createPost, 
    getAllPosts, 
    getPostById, 
    upvotePost, 
    downvotePost, 
    markPostAsAnswered, 
    updatePost, 
    deletePost, 
    getPostsByCategory 
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/category/:category", getPostsByCategory); //*not checked

// Protected routes
router.post("/", verifyJWT, upload.single('media'), createPost);
router.post("/:id/upvote", verifyJWT, upvotePost);
router.post("/:id/downvote", verifyJWT, downvotePost);
router.patch("/:id/answered", verifyJWT, markPostAsAnswered); //*not checked
router.put("/:id", verifyJWT, upload.single('media'), updatePost);
router.delete("/:id", verifyJWT, deletePost);

export default router;