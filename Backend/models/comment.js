import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    movieId: {
      type: Number,
      required: [true, "Movie ID is required"],
      min: [1, "Movie ID must be positive"],
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Efficiently retrieve comments for a movie, newest first.
commentSchema.index({ movieId: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;