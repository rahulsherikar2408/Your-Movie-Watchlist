import { useEffect, useState } from "react";
import axios from "axios";

import MovieCard from "./MovieCard";
import Pagination from "./Pagination";

function Movies({ searchQuery, watchList, category, handleAddToWatchList, handleRemoveFromWatchList }) {
  const [movies, setMovies] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;

  // Reset pagination when the search or category changes.
  useEffect(() => {
    setPageNo(1);
  }, [searchQuery, category]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMovies = async () => {
      const query = searchQuery.trim();

      if (!tmdbApiKey) {
        setMovies([]);
        setTotalPages(1);
        setError("TMDB API key is missing. Check your .env file.");
        return;
      }

      // Debounce searches; category browsing loads immediately.
      if (query) {
        await new Promise((resolve) => {
          const timeoutId = setTimeout(resolve, 350);

          controller.signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timeoutId);
              resolve();
            },
            { once: true },
          );
        });

        if (controller.signal.aborted) return;
      }

      setLoading(true);
      setError("");

      try {
        let endpoint;
        const params = {
          api_key: tmdbApiKey,
          language: "en-US",
          page: pageNo,
        };

        // Search takes priority over the selected category.
        if (query) {
          endpoint = "/search/movie";
          params.query = query;
          params.include_adult = false;
        } else {
          switch (category) {
            case "Popular Movies":
              endpoint = "/movie/popular";
              break;

            case "Top Rated Movies":
              endpoint = "/movie/top_rated";
              break;

            default:
              endpoint = "/trending/movie/day";
              break;
          }
        }

        const response = await axios.get(
          `https://api.themoviedb.org/3${endpoint}`,
          {
            params,
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) return;

        setMovies(response.data.results || []);
        setTotalPages(response.data.total_pages,);
      } catch (err) {
        if (controller.signal.aborted || err.code === "ERR_CANCELED") {
          return;
        }

        console.error("Error fetching movies:", err);

        setMovies([]);
        setTotalPages(1);
        setError(
          err.response?.data?.status_message ||
          "Unable to load movies. Please try again.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMovies();

    return () => controller.abort();
  }, [pageNo, category, searchQuery, tmdbApiKey]);

  const heading = searchQuery.trim()
    ? `Search Results for "${searchQuery.trim()}"`
    : category === "Category"
      ? "Trending Movies"
      : category;

  return (
    <div className="@container p-2">
      <h2 className="mb-3 text-center text-lg font-bold">{heading}</h2>

      {loading && (
        <div className="flex min-h-40 flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-3 text-sm text-gray-500">Loading movies...</p>
        </div>
      )}

      {!loading && error && (
        <div className="py-10 text-center">
          <p role="alert" className="text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setPageNo((page) => page)}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <p className="py-10 text-center text-gray-500">
          {searchQuery.trim()
            ? "No movies found. Try a different search."
            : "No movies available right now."}
        </p>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="flex flex-row flex-wrap justify-center sm:justify-start">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              title={movie.title}
              poster_path={movie.poster_path}
              watchList={watchList}
              handleAddToWatchList={handleAddToWatchList}
              handleRemoveFromWatchList={handleRemoveFromWatchList}
            />
          ))}
        </div>
      )}

      {!loading && !error && movies.length > 0 && (
        <Pagination
          pageNo={pageNo}
          setPageNo={setPageNo}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}

export default Movies;
