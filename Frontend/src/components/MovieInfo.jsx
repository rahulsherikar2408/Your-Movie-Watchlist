import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import { useAuth } from "../context/AuthContext";
import { addMovieToWatchlist, removeMovieFromWatchlist } from "../redux/watchlistSlice.js";

const MovieInfo = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useAuth();

  const watchList = useSelector(
    (state) => state.watchlist.movies
  );

  const [movieData, setMovieData] = useState(
    location.state?.movie || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  // Fetch complete movie details from TMDB
  useEffect(() => {
    const controller = new AbortController();

    const getMovieInfoData = async () => {
      setLoading(true);
      setError("");

      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;

        if (!apiKey) {
          throw new Error(
            "TMDB API key is missing. Check your frontend .env file."
          );
        }

        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}`,
          {
            params: {
              api_key: apiKey,
              language: "en-US",
            },
            signal: controller.signal,
          }
        );

        setMovieData(response.data);
      } catch (err) {
        if (err.code === "ERR_CANCELED") return;

        console.error("Error fetching movie details:", err);

        setError(
          err.response?.status === 404
            ? "Movie not found."
            : err.message ||
                "Unable to load movie details. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    getMovieInfoData();

    return () => controller.abort();
  }, [id]);

  // Check whether the movie is already saved
  const isInWatchlist = useMemo(() => {
    if (!movieData?.id) return false;

    return watchList.some(
      (movie) => Number(movie.id) === Number(movieData.id)
    );
  }, [watchList, movieData?.id]);

  // Normalize the movie object for the MongoDB watchlist
  const savedMovie = useMemo(() => {
    if (!movieData) return null;

    return {
      id: movieData.id,
      title: movieData.title,
      poster_path: movieData.poster_path || null,
      vote_average: movieData.vote_average || 0,
      popularity: movieData.popularity || 0,
      genre_ids: movieData.genres
        ? movieData.genres.map((genre) => genre.id)
        : movieData.genre_ids || [],
      overview: movieData.overview || "",
      release_date: movieData.release_date || "",
    };
  }, [movieData]);

  // Add or remove the movie through Redux and the backend
  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      });
      return;
    }

    if (!savedMovie || saving) return;

    setSaving(true);
    setActionError("");

    try {
      if (isInWatchlist) {
        await dispatch(
          removeMovieFromWatchlist(savedMovie.id)
        ).unwrap();
      } else {
        await dispatch(
          addMovieToWatchlist(savedMovie)
        ).unwrap();
      }
    } catch (err) {
      setActionError(
        typeof err === "string"
          ? err
          : "Unable to update your watchlist. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-white pb-10">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="ml-4 mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition duration-200 hover:scale-110 hover:bg-gray-200 sm:ml-12 sm:mt-7"
      >
        <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
      </button>

      {/* Loading State */}
      {loading && (
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-gray-600">
            Loading movie details...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mx-auto mt-10 max-w-xl px-5 text-center">
          <p role="alert" className="text-lg font-semibold text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Browse Movies
          </button>
        </div>
      )}

      {/* Movie Details */}
      {!loading && !error && movieData && (
        <div className="mx-auto mt-4 flex max-w-7xl flex-col items-center gap-7 px-5 sm:mx-10 sm:flex-row sm:items-start sm:gap-10 lg:px-8">

          {/* Poster and Watchlist Button */}
          <div className="flex w-full shrink-0 flex-col items-center sm:w-auto">
            <img
              className="h-[380px] w-[260px] rounded-xl object-cover shadow-lg sm:h-[400px] sm:w-[280px]"
              src={
                movieData.poster_path
                  ? `https://image.tmdb.org/t/p/original${movieData.poster_path}`
                  : "https://placehold.co/280x400?text=No+Poster"
              }
              alt={`${movieData.title} poster`}
            />

            <button
              type="button"
              onClick={handleWatchlistToggle}
              disabled={saving}
              className={`mt-4 h-12 w-[260px] rounded-lg font-bold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[280px] ${
                isInWatchlist
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {saving
                ? "Updating Watchlist..."
                : isInWatchlist
                  ? "Remove from Watchlist"
                  : "Add to Watchlist"}
            </button>

            {actionError && (
              <p
                role="alert"
                className="mt-3 max-w-[280px] text-center text-sm text-red-600"
              >
                {actionError}
              </p>
            )}

            {!isAuthenticated && (
              <p className="mt-2 text-center text-xs text-gray-500">
                Log in to save movies to your watchlist.
              </p>
            )}
          </div>

          {/* Movie Information */}
          <div className="flex w-full max-w-3xl flex-col items-start gap-4 sm:pt-3">
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              {movieData.title}
            </h1>

            {movieData.tagline && (
              <p className="text-base italic text-gray-500">
                {movieData.tagline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
              <span className="flex items-center gap-2 font-semibold text-gray-800">
                <i
                  className="fa-solid fa-star text-yellow-400"
                  aria-hidden="true"
                />
                {Number(movieData.vote_average || 0).toFixed(1)}/10
              </span>

              <span className="text-gray-500">
                ({Number(movieData.vote_count || 0).toLocaleString()} votes)
              </span>

              {movieData.release_date && (
                <span className="text-gray-600">
                  Released: {movieData.release_date}
                </span>
              )}
            </div>

            {/* Genres */}
            {movieData.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movieData.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="mt-1">
              <h2 className="mb-2 text-lg font-bold text-gray-900">
                Overview
              </h2>

              <p className="text-sm leading-7 text-gray-600 sm:text-base">
                {movieData.overview || "No overview is available for this movie."}
              </p>
            </div>

            {/* Additional Details */}
            <div className="mt-2 grid w-full grid-cols-1 gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
              {movieData.runtime > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Runtime</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {Math.floor(movieData.runtime / 60)}h{" "}
                    {movieData.runtime % 60}m
                  </p>
                </div>
              )}

              {movieData.original_language && (
                <div>
                  <p className="text-sm text-gray-500">
                    Original Language
                  </p>
                  <p className="mt-1 font-semibold uppercase text-gray-800">
                    {movieData.original_language}
                  </p>
                </div>
              )}

              {movieData.status && (
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    {movieData.status}
                  </p>
                </div>
              )}

              {movieData.budget > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="mt-1 font-semibold text-gray-800">
                    ${movieData.budget.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieInfo;