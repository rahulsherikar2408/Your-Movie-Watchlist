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

  // Watchlist action loading state
  const [watchlistSaving, setWatchlistSaving] = useState(false);

  // Trailer states
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const [trailerNotice, setTrailerNotice] = useState("");
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

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

  // Fetch trailer videos from TMDB
  useEffect(() => {
    const controller = new AbortController();

    const fetchVideos = async () => {
      setTrailerLoading(true);
      setVideos([]);
      setSelectedVideo(null);

      if (!TMDB_API_KEY) {
        setTrailerLoading(false);
        return;
      }

      try {
        const primaryEndpoint = activeType === "tv" ? "tv" : "movie";
        let response = await fetch(
          `https://api.themoviedb.org/3/${primaryEndpoint}/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`,
          { signal: controller.signal }
        );

        if (!response.ok && response.status === 404) {
          const fallbackEndpoint = primaryEndpoint === "tv" ? "movie" : "tv";
          const fallbackRes = await fetch(
            `https://api.themoviedb.org/3/${fallbackEndpoint}/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`,
            { signal: controller.signal }
          );
          if (fallbackRes.ok) {
            response = fallbackRes;
          }
        }

        if (response.ok) {
          const data = await response.json();
          let results = data.results || [];

          // If no videos returned with language=en-US, try without language filter as fallback
          if (results.length === 0) {
            const endpoint = activeType === "tv" ? "tv" : "movie";
            const noLangRes = await fetch(
              `https://api.themoviedb.org/3/${endpoint}/${movieId}/videos?api_key=${TMDB_API_KEY}`,
              { signal: controller.signal }
            );
            if (noLangRes.ok) {
              const noLangData = await noLangRes.json();
              if (noLangData.results?.length > 0) {
                results = noLangData.results;
              }
            }
          }

          setVideos(results);

          // Find the best official trailer or teaser
          const bestVideo =
            results.find(
              (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
            ) ||
            results.find(
              (v) => v.site === "YouTube" && v.type === "Trailer"
            ) ||
            results.find(
              (v) =>
                v.site === "YouTube" &&
                (v.type === "Teaser" || v.type === "Clip")
            ) ||
            results.find((v) => v.site === "YouTube") ||
            results[0] ||
            null;

          setSelectedVideo(bestVideo);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching trailer videos:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setTrailerLoading(false);
        }
      }
    };

    if (Number.isSafeInteger(movieId) && movieId > 0) {
      fetchVideos();
    }

    return () => controller.abort();
  }, [movieId, activeType]);

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsTrailerModalOpen(false);
      }
    };

    if (isTrailerModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isTrailerModalOpen]);

  const handleWatchTrailer = () => {
    if (selectedVideo && selectedVideo.key) {
      setTrailerNotice("");
      setIsTrailerModalOpen(true);
    } else {
      setTrailerNotice("No trailer is currently available for this title.");
      setTimeout(() => setTrailerNotice(""), 4000);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }

    setWatchlistSaving(true);
    try {
      if (isInWatchlist) {
        await handleRemoveFromWatchList?.(
          watchList.find((item) => Number(item.id) === movieId)
        );
      } else {
        await handleAddToWatchList?.({
          ...(location.state?.movie ?? movieData),
          title: displayTitle,
          release_date: releaseDate,
        });
      }
    } catch {
      // red/green toast is handled centrally in App.jsx
    } finally {
      setWatchlistSaving(false);
    }
  };

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

  const displayTitle =
    movieData?.title || movieData?.name || "Untitled";
  const releaseDate =
    movieData?.release_date || movieData?.first_air_date || "";
  const releaseYear = releaseDate ? releaseDate.slice(0, 4) : "";
  const runtime = movieData?.runtime
    ? `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}m`
    : movieData?.number_of_seasons
      ? `${movieData.number_of_seasons} ${movieData.number_of_seasons === 1 ? "Season" : "Seasons"}`
      : null;

  return (
    <main className="min-h-screen bg-gray-50 pb-16 text-base">
      {/* Loading State */}
      {movieLoading ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-base font-semibold text-gray-600">
            Loading title details...
          </p>
        </div>
      ) : movieError ? (
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-700">
          <i className="fa-solid fa-triangle-exclamation text-4xl mb-3 text-red-500" />
          <h2 className="text-xl font-bold">Unable to load details</h2>
          <p className="mt-2 text-base">{movieError}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-bold text-white shadow hover:bg-blue-700 transition"
          >
            <i className="fa-solid fa-arrow-left" />
            <span>Go Back</span>
          </button>
        </div>
      ) : movieData ? (
        <>
          {/* Cinematic Backdrop Header */}
          <div className="relative h-[300px] w-full overflow-hidden bg-gray-950 sm:h-[400px] md:h-[460px]">
            {movieData.backdrop_path ? (
              <img
                src={`${TMDB_IMAGE_BASE_URL}${movieData.backdrop_path}`}
                alt={displayTitle}
                className="h-full w-full object-cover object-top opacity-40 filter blur-[0.5px]"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-950 opacity-90" />
            )}

            {/* Gradient Fades */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-950/40 to-gray-950/80" />

            {/* Floating Navigation Bar over Backdrop */}
            <div className="absolute left-0 right-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between p-4 sm:p-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4.5 py-2.5 text-sm sm:text-base font-bold text-white backdrop-blur-md transition hover:bg-black hover:scale-105 active:scale-95 shadow-md border border-white/10"
              >
                <i className="fa-solid fa-arrow-left text-sm" />
                <span>Back</span>
              </button>

              <span className="rounded-full bg-black/60 px-3.5 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-400 backdrop-blur-md border border-white/10">
                {movieData.first_air_date ? "TV Series" : "Movie"}
              </span>
            </div>
          </div>

          {/* Hero Content Section */}
          <section className="relative z-10 mx-auto -mt-36 max-w-6xl px-4 sm:-mt-48 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 rounded-3xl bg-white p-6 shadow-xl sm:flex-row sm:items-start sm:p-8 border border-gray-100">
              {/* Left Column: Poster + Actions */}
              <div className="flex shrink-0 flex-col items-center sm:w-68 md:w-76">
                <img
                  className="aspect-[2/3] w-56 rounded-2xl object-cover shadow-2xl ring-4 ring-white sm:w-full"
                  src={
                    movieData.poster_path
                      ? `${TMDB_IMAGE_BASE_URL}${movieData.poster_path}`
                      : "https://placehold.co/300x450?text=No+Poster"
                  }
                  alt={displayTitle}
                />

                {/* Primary Watch Trailer Action */}
                <button
                  type="button"
                  onClick={handleWatchTrailer}
                  disabled={trailerLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-red-500/25 transition hover:from-red-700 hover:to-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {trailerLoading ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin text-lg" />
                      <span>Loading Trailer...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-play text-xl" />
                      <span>
                        {selectedVideo ? "Watch Trailer" : "Trailer"}
                      </span>
                    </>
                  )}
                </button>

                {trailerNotice && (
                  <p
                    role="status"
                    className="mt-2 text-center text-sm font-semibold text-amber-600"
                  >
                    {trailerNotice}
                  </p>
                )}

                {/* Watchlist Toggle Button with Spinner */}
                <button
                  type="button"
                  disabled={watchlistSaving}
                  onClick={handleToggleWatchlist}
                  className={`mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl border px-5 py-3 text-base font-bold transition active:scale-95 disabled:opacity-60 ${
                    isInWatchlist
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                      : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {watchlistSaving ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin text-base" />
                      <span>{isInWatchlist ? "Removing..." : "Adding..."}</span>
                    </>
                  ) : isInWatchlist ? (
                    <>
                      <i className="fa-solid fa-heart-crack text-base" />
                      <span>In Watchlist (Remove)</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-heart text-base" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Title & Metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-500 mb-1.5">
                  {releaseYear && <span>{releaseYear}</span>}
                  {releaseYear && runtime && <span>•</span>}
                  {runtime && <span>{runtime}</span>}
                  {movieData.status && (
                    <>
                      <span>•</span>
                      <span className="text-gray-700 font-bold">{movieData.status}</span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-5xl leading-tight">
                  {displayTitle}
                </h1>

                {movieData.tagline && (
                  <p className="mt-2 text-base italic text-gray-500 font-medium">
                    "{movieData.tagline}"
                  </p>
                )}

                {/* Ratings & Key Metrics */}
                <div className="mt-5 flex flex-wrap items-center gap-3.5">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-base font-bold text-amber-700 border border-amber-200/60 shadow-sm">
                    <i className="fa-solid fa-star text-amber-500 text-sm" />
                    <span>
                      {Number(movieData.vote_average || 0).toFixed(1)} / 10
                    </span>
                    <span className="text-xs sm:text-sm font-normal text-amber-600/80">
                      ({movieData.vote_count ? movieData.vote_count.toLocaleString() : 0} votes)
                    </span>
                  </div>

                  {movieData.popularity && (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3.5 py-2 text-sm font-semibold text-gray-700">
                      <i className="fa-solid fa-fire text-orange-500 text-sm" />
                      <span>{Math.round(movieData.popularity)} Popularity</span>
                    </div>
                  )}
                </div>

                {/* Genres Pills */}
                {movieData.genres && movieData.genres.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {movieData.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-700 border border-blue-100"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Overview */}
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                    Overview
                  </h2>
                  <p className="mt-2.5 text-base sm:text-lg leading-relaxed text-gray-700">
                    {movieData.overview || "No overview is currently available for this title."}
                  </p>
                </div>

                {/* Release Info */}
                {releaseDate && (
                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <i className="fa-regular fa-calendar text-base" />
                    <span>
                      {movieData.first_air_date ? "Original Air Date:" : "Theatrical Release Date:"}{" "}
                      <strong className="text-gray-800">{releaseDate}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {/* Comments Section */}
      <section className="mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <i className="fa-regular fa-comments text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  Discussion & Reviews
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  Join the community conversation about this title
                </p>
              </div>
            </div>

            <span className="rounded-full bg-gray-100 px-3.5 py-1.5 text-sm font-bold text-gray-700">
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </span>
          </div>

          {/* Add comment form */}
          {authLoading ? (
            <p className="mt-5 text-sm text-gray-500">
              Checking your sign-in status...
            </p>
          ) : isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mt-6">
              <label
                htmlFor="new-comment"
                className="mb-2 block text-base font-bold text-gray-800"
              >
                Leave a comment
              </label>

              <textarea
                id="new-comment"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Share your review, favorite scenes, or thoughts..."
                rows={3}
                maxLength={1000}
                className="w-full resize-y rounded-2xl border border-gray-300 p-4 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-inner"
              />

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-400">
                  {commentText.length}/1000 characters
                </span>

                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin text-base" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-paper-plane text-sm" />
                      <span>Post Comment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Want to share your review?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Sign in or create an account to post comments and join discussions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoginRedirect}
                className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
              >
                Sign In to Comment
              </button>
            </div>
          )}

          {/* Feedback banners */}
          {formError && (
            <div
              role="alert"
              className="mt-4 flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 text-sm font-semibold text-red-700 border border-red-100"
            >
              <i className="fa-solid fa-circle-exclamation text-red-500 text-base" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mt-4 flex items-center gap-2.5 rounded-xl bg-green-50 p-3.5 text-sm font-semibold text-green-700 border border-green-100"
            >
              <i className="fa-solid fa-circle-check text-green-500 text-base" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Comments list */}
          <div className="mt-6 space-y-4">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                <span className="ml-3 text-sm font-medium text-gray-500">
                  Loading discussions...
                </span>
              </div>
            ) : commentsError ? (
              <div className="rounded-2xl bg-red-50 p-5 text-center text-red-700">
                <p className="text-base">{commentsError}</p>
                <button
                  type="button"
                  onClick={fetchComments}
                  className="mt-2 text-sm font-bold underline"
                >
                  Try again
                </button>
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-5 py-10 text-center">
                <i className="fa-regular fa-comments text-4xl text-gray-400 mb-2" />
                <p className="text-lg font-bold text-gray-700">No reviews yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Be the first to share your thoughts on this title!
                </p>
              </div>
            ) : (
              comments.map((comment) => {
                const isOwner = isCommentOwner(comment);
                const isEditing = editingCommentId === comment.id;

                return (
                  <article
                    key={comment.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4.5 transition sm:p-5.5 hover:bg-gray-50/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 font-black text-white shadow-sm text-base">
                          {(comment.user?.name || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-gray-900">
                            {comment.user?.name || "Community Member"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400 font-medium">
                            {formatDate(comment.createdAt)}
                            {comment.updatedAt !== comment.createdAt && (
                              <span> • edited</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {isOwner && !isEditing && (
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(comment)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition"
                          >
                            <i className="fa-regular fa-pen-to-square text-xs" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={deletingCommentId === comment.id}
                            onClick={() => handleDeleteComment(comment.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            {deletingCommentId === comment.id ? (
                              <>
                                <i className="fa-solid fa-spinner animate-spin text-xs" />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <i className="fa-regular fa-trash-can text-xs" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          maxLength={1000}
                          className="w-full resize-y rounded-xl border border-gray-300 p-3.5 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {editText.length}/1000
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-300 transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={savingEdit || !editText.trim()}
                              onClick={() => handleSaveEdit(comment.id)}
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4.5 py-2 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              {savingEdit ? (
                                <>
                                  <i className="fa-solid fa-spinner animate-spin text-xs" />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <span>Save Changes</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3.5 whitespace-pre-wrap text-base text-gray-700 leading-relaxed sm:pl-14">
                        {comment.text}
                      </p>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Trailer Video Modal */}
      {isTrailerModalOpen && selectedVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${displayTitle} Trailer`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-6"
          onClick={() => setIsTrailerModalOpen(false)}
        >
          <div
            className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-gray-800 bg-gray-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-800/80 px-6 py-4 text-white">
              <div className="flex items-center gap-3 overflow-hidden pr-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm">
                  <i className="fa-solid fa-play text-sm" />
                </div>
                <h3 className="truncate text-base sm:text-lg font-bold">
                  {selectedVideo.name || `${displayTitle} Trailer`}
                </h3>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {selectedVideo.site === "YouTube" && (
                  <a
                    href={`https://www.youtube.com/watch?v=${selectedVideo.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden items-center gap-2 rounded-full bg-gray-800/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-gray-300 transition hover:bg-gray-700 hover:text-white sm:inline-flex border border-gray-700/50"
                    title="Open on YouTube"
                  >
                    <span>YouTube</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setIsTrailerModalOpen(false)}
                  aria-label="Close trailer modal"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition hover:bg-gray-700 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              {selectedVideo.site === "YouTube" ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0`}
                  title={selectedVideo.name || "Trailer"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-6 text-center text-gray-400">
                  <p className="text-base">
                    Trailer hosted on {selectedVideo.site}.{" "}
                    <a
                      href={selectedVideo.key}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline font-bold"
                    >
                      Watch external video
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Multiple Videos Selector */}
            {videos.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto border-t border-gray-800 bg-gray-900/90 p-3 sm:px-6">
                <span className="shrink-0 text-xs sm:text-sm font-bold text-gray-400">
                  Other Videos:
                </span>
                {videos.slice(0, 6).map((v) => (
                  <button
                    key={v.id || v.key}
                    type="button"
                    onClick={() => setSelectedVideo(v)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                      selectedVideo.key === v.key
                        ? "bg-red-600 text-white font-bold"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {v.type || "Clip"}:{" "}
                    {v.name && v.name.length > 25
                      ? `${v.name.slice(0, 25)}…`
                      : v.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default MovieInfo;