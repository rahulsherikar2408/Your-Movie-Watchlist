import express from "express";

import { getMovieComments, createComment, updateComment, deleteComment } from "../controllers/commentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/movies/:movieId/comments", getMovieComments);

// Protected routes
router.post("/movies/:movieId/comments", protect, createComment);

router.patch("/comments/:commentId", protect, updateComment);

router.delete("/comments/:commentId", protect, deleteComment);

export default router;