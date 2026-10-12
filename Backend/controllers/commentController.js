import mongoose from "mongoose";
import Comment from "../models/comment.js";

// GET /api/movies/:movieId/comments
// Public: retrieve comments for a movie.
export const getMovieComments = async (req, res, next) => {
  try {
    const movieId = Number(req.params.movieId);

    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid movie ID is required.",
      });
    }

    const comments = await Comment.find({ movieId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments: comments.map((comment) => ({
        id: comment._id,
        movieId: comment.movieId,
        text: comment.text,
        user: comment.user
          ? {
              id: comment.user._id,
              name: comment.user.name,
            }
          : null,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/movies/:movieId/comments
// Protected: create a comment for the authenticated user.
export const createComment = async (req, res, next) => {
  try {
    const movieId = Number(req.params.movieId);
    const { text } = req.body;

    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid movie ID is required.",
      });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });
    }

    if (text.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 1000 characters.",
      });
    }

    // Never accept a user ID from the request body.
    const comment = await Comment.create({
      movieId,
      user: req.user.id,
      text: text.trim(),
    });

    await comment.populate("user", "name");

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment: {
        id: comment._id,
        movieId: comment.movieId,
        text: comment.text,
        user: {
          id: comment.user._id,
          name: comment.user.name,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/comments/:commentId
// Protected: only the comment's owner may edit it.
export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID.",
      });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required.",
      });
    }

    if (text.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 1000 characters.",
      });
    }

    const comment = await Comment.findOneAndUpdate(
      {
        _id: commentId,
        user: req.user.id,
      },
      {
        $set: { text: text.trim() },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or you are not allowed to edit it.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      comment: {
        id: comment._id,
        movieId: comment.movieId,
        text: comment.text,
        user: {
          id: comment.user._id,
          name: comment.user.name,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/comments/:commentId
// Protected: only the comment's owner may delete it.
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID.",
      });
    }

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      user: req.user.id,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or you are not allowed to delete it.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
};