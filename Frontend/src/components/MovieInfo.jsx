import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import api from "../services/api.js";
import { useAuth } from "../context/authContext.js";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

function MovieInfo({
  contentType: defaultContentType = "movie",
  watchList = [],
  handleAddToWatchList,
  handleRemoveFromWatchList,
}) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const activeType =
    location.state?.contentType ||
    (location.state?.movie?.first_air_date ? "tv" : null) ||
    defaultContentType ||
    localStorage.getItem("contentType") ||
    "movie";

  const [movieData, setMovieData] = useState(location.state?.movie ?? null);
  const [movieLoading, setMovieLoading] = useState(true);
  const [movieError, setMovieError] = useState("");

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const movieId = Number(id);

  const isInWatchlist = watchList.some(
    (item) => Number(item.id) === movieId
  );

  // Fetch the full details from TMDB (supporting movie or tv).
  useEffect(() => {
    const controller = new AbortController();

    const fetchDetails = async () => {
      setMovieLoading(true);
      setMovieError("");

      if (!TMDB_API_KEY) {
        setMovieError("TMDB API key is not configured.");
        setMovieLoading(false);
        return;
      }

      try {
        const primaryEndpoint = activeType === "tv" ? "tv" : "movie";
        let response = await fetch(
          `https://api.themoviedb.org/3/${primaryEndpoint}/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`,
          { signal: controller.signal }
        );

        if (!response.ok && response.status === 404) {
          const fallbackEndpoint = primaryEndpoint === "tv" ? "movie" : "tv";
          const fallbackRes = await fetch(
            `https://api.themoviedb.org/3/${fallbackEndpoint}/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`,
            { signal: controller.signal }
          );
          if (fallbackRes.ok) {
            response = fallbackRes;
          }
        }

        if (!response.ok) {
          throw new Error("Unable to load details.");
        }

        const data = await response.json();
        setMovieData(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          setMovieError(error.message || "Unable to load details.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setMovieLoading(false);
        }
      }
    };

    if (Number.isSafeInteger(movieId) && movieId > 0) {
      fetchDetails();
    } else {
      setMovieError("Invalid ID.");
      setMovieLoading(false);
    }

    return () => controller.abort();
  }, [movieId, activeType]);

  // Fetch comments. This endpoint is public, so no login is required.
  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentsError("");

    try {
      const response = await api.get(`/movies/${movieId}/comments`);
      setComments(response.data.comments ?? []);
    } catch (error) {
      setCommentsError(
        error.response?.data?.message ||
          "Unable to load comments. Please try again."
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // Re-fetch when navigating to a different movie.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const handleLoginRedirect = () => {
    navigate("/login", {
      state: { from: { pathname: location.pathname } },
    });
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const trimmedText = commentText.trim();

    if (!trimmedText) {
      setFormError("Please enter a comment.");
      return;
    }

    if (trimmedText.length > 1000) {
      setFormError("Comments cannot exceed 1000 characters.");
      return;
    }

    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post(`/movies/${movieId}/comments`, {
        text: trimmedText,
      });

      const newComment = response.data.comment;

      setComments((current) => [
        newComment,
        ...current.filter((comment) => comment.id !== newComment.id),
      ]);

      setCommentText("");
      setSuccessMessage("Your comment was added.");
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Unable to add your comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
    setFormError("");
    setSuccessMessage("");
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleSaveEdit = async (commentId) => {
    setFormError("");
    setSuccessMessage("");

    const trimmedText = editText.trim();

    if (!trimmedText) {
      setFormError("Comment cannot be empty.");
      return;
    }

    if (trimmedText.length > 1000) {
      setFormError("Comments cannot exceed 1000 characters.");
      return;
    }

    setSavingEdit(true);

    try {
      const response = await api.patch(`/comments/${commentId}`, {
        text: trimmedText,
      });

      const updatedComment = response.data.comment;

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      );

      setEditingCommentId(null);
      setEditText("");
      setSuccessMessage("Your comment was updated.");
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Unable to update the comment. Please try again."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    setFormError("");
    setSuccessMessage("");
    setDeletingCommentId(commentId);

    try {
      await api.delete(`/comments/${commentId}`);

      setComments((current) =>
        current.filter((comment) => comment.id !== commentId)
      );

      setSuccessMessage("Your comment was deleted.");
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Unable to delete the comment. Please try again."
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  const isCommentOwner = (comment) => {
    if (!user || !comment.user) return false;

    const currentUserId = user._id ?? user.id;
    const commentUserId = comment.user.id ?? comment.user._id;

    return (
      currentUserId &&
      commentUserId &&
      String(currentUserId) === String(commentUserId)
    );
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="ml-4 mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm transition hover:scale-105 sm:ml-12 sm:mt-7"
      >
        <i className="fa-solid fa-arrow-left" />
      </button>

      {/* Movie details */}
      {movieLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-3 text-gray-600">Loading details...</p>
          </div>
        </div>
      ) : movieError ? (
        <div className="mx-auto mt-8 max-w-3xl rounded-xl bg-red-50 p-5 text-center text-red-700">
          {movieError}
        </div>
      ) : movieData ? (
        <section className="mx-auto mt-4 flex max-w-6xl flex-col gap-8 px-5 sm:flex-row sm:items-start sm:px-8">
          <div className="flex shrink-0 flex-col items-center">
            <img
              className="h-[330px] w-[220px] rounded-xl object-cover shadow-lg sm:h-[390px] sm:w-[270px]"
              src={
                movieData.poster_path
                  ? `${TMDB_IMAGE_BASE_URL}${movieData.poster_path}`
                  : "https://placehold.co/270x390?text=No+Poster"
              }
              alt={movieData.title || movieData.name || "Poster"}
            />

            {isInWatchlist ? (
              <button
                type="button"
                onClick={() =>
                  handleRemoveFromWatchList?.(
                    watchList.find((item) => Number(item.id) === movieId)
                  )
                }
                className="mt-4 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Remove from Watchlist
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleAddToWatchList?.({
                    ...(location.state?.movie ?? movieData),
                    title: movieData.title || movieData.name || "Untitled",
                    release_date: movieData.release_date || movieData.first_air_date || "",
                  })
                }
                className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Add to Watchlist
              </button>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900">
              {movieData.title || movieData.name}
            </h1>

            {movieData.tagline && (
              <p className="mt-2 italic text-gray-500">
                {movieData.tagline}
              </p>
            )}

            <p className="mt-4 text-gray-700">
              <i className="fa-solid fa-star mr-2 text-yellow-400" />
              {Number(movieData.vote_average || 0).toFixed(1)}/10
              <span className="ml-2 text-sm text-gray-500">
                ({movieData.vote_count ?? 0} votes)
              </span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {movieData.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <h2 className="mt-6 text-lg font-bold text-gray-900">
              Overview
            </h2>
            <p className="mt-2 leading-7 text-gray-700">
              {movieData.overview || "No overview is available."}
            </p>

            {(movieData.release_date || movieData.first_air_date) && (
              <p className="mt-4 text-sm text-gray-500">
                {movieData.first_air_date ? "First air date:" : "Release date:"}{" "}
                {movieData.first_air_date || movieData.release_date}
              </p>
            )}
          </div>
        </section>
      ) : null}

      {/* Comments */}
      <section className="mx-auto mt-12 max-w-4xl px-5 sm:px-8">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Comments
            <span className="ml-2 text-lg font-medium text-gray-500">
              ({comments.length})
            </span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Share your thoughts about this title.
          </p>
        </div>

        {/* Add comment form */}
        {authLoading ? (
          <p className="mt-5 text-sm text-gray-500">
            Checking your sign-in status...
          </p>
        ) : isAuthenticated ? (
          <form
            onSubmit={handleSubmitComment}
            className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <label
              htmlFor="new-comment"
              className="mb-2 block font-semibold text-gray-800"
            >
              Write a comment
            </label>

            <textarea
              id="new-comment"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="What did you think of this movie?"
              rows={4}
              maxLength={1000}
              className="w-full resize-y rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-gray-500">
                {commentText.length}/1000 characters
              </span>

              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-gray-700">
              Sign in to join the conversation.
            </p>
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
            >
              Sign in to comment
            </button>
          </div>
        )}

        {/* Feedback */}
        {formError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {formError}
          </p>
        )}

        {successMessage && (
          <p
            role="status"
            className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            {successMessage}
          </p>
        )}

        {/* Comments list */}
        <div className="mt-6 space-y-4">
          {commentsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <span className="ml-3 text-sm text-gray-500">
                Loading comments...
              </span>
            </div>
          ) : commentsError ? (
            <div className="rounded-xl bg-red-50 p-4 text-red-700">
              <p>{commentsError}</p>
              <button
                type="button"
                onClick={fetchComments}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
              <i className="fa-regular fa-comments text-3xl text-gray-400" />
              <p className="mt-3 font-semibold text-gray-700">
                No comments yet
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to share your thoughts.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isOwner = isCommentOwner(comment);
              const isEditing = editingCommentId === comment.id;

              return (
                <article
                  key={comment.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {(comment.user?.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {comment.user?.name || "Former user"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                          {comment.updatedAt !== comment.createdAt && (
                            <span> · edited</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {isOwner && !isEditing && (
                      <div className="flex shrink-0 gap-3 text-sm">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(comment)}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingCommentId === comment.id}
                          onClick={() => handleDeleteComment(comment.id)}
                          className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {deletingCommentId === comment.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-4">
                      <textarea
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        maxLength={1000}
                        rows={3}
                        aria-label="Edit your comment"
                        className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <p className="mt-1 text-right text-xs text-gray-500">
                        {editText.length}/1000 characters
                      </p>

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={savingEdit}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={savingEdit || !editText.trim()}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-gray-700">
                      {comment.text}
                    </p>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

export default MovieInfo;