import express from "express";
import { protectRoute } from "../middleware/auth.middleware";
import {getFeedPosts, createPost, deletePost, getPostById, createComment} from "../controllers/post.controller.js"

const router = express.Router();

router.get("/", protectRoute, getFeedPosts);
router.get("/:id", protectRoute, getPostById);

router.post("/create", protectRoute, createPost);
router.post("/delete/:id", protectRoute, deletePost);
router.post("/:id/comment", protectRoute, createComment);

export default router;