import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import MovieCard from "./MovieCard";
import Pagination from "./Pagination";

function Movies({
  contentType = "movie",
  searchQuery,
  watchList,
  category,
  handleAddToWatchList,
  handleRemoveFromWatchList,
  pageNo: externalPageNo,
  setPageNo: setExternalPageNo,
}) {
  const [movies, setMovies] = useState([]);
  const [internalPageNo, setInternalPageNo] = useState(1);
  const pageNo = externalPageNo !== undefined ? externalPageNo : internalPageNo;
  const setPageNo = setExternalPageNo || setInternalPageNo;

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const prevFilters = useRef({ searchQuery, category, contentType });

  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;
  const isTv = contentType === "tv";

  // If the URL has ?page=X on mount, sync pageNo to it
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page"), 10);
    if (pageFromUrl && pageFromUrl > 0 && pageFromUrl !== pageNo) {
      setPageNo(pageFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset pagination only when search, category, or content type actually CHANGES (not on initial mount or back-navigation)
  useEffect(() => {
    const prev = prevFilters.current;
    const hasChanged =
      prev.searchQuery !== searchQuery ||
      prev.category !== category ||
      prev.contentType !== contentType;

    if (hasChanged) {
      prevFilters.current = { searchQuery, category, contentType };
      setPageNo(1);
      setSearchParams((currentParams) => {
        const next = new URLSearchParams(currentParams);
        next.delete("page");
        return next;
      });
    }
  }, [searchQuery, category, contentType, setPageNo, setSearchParams]);

  const handlePageChange = (newPage) => {
    setPageNo(newPage);
    setSearchParams((currentParams) => {
      const next = new URLSearchParams(currentParams);
      if (newPage <= 1) {
        next.delete("page");
      } else {
        next.set("page", String(newPage));
      }
      return next;
    });
  };

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
        const typePath = isTv ? "tv" : "movie";
        const params = {
          api_key: tmdbApiKey,
          language: "en-US",
          page: pageNo,
        };

        // Search takes priority over the selected category.
        if (query) {
          endpoint = `/search/${typePath}`;
          params.query = query;
          params.include_adult = false;
        } else {
          switch (category) {
            case "Popular Movies":
            case "Popular TV Shows":
              endpoint = `/${typePath}/popular`;
              break;

            case "Top Rated Movies":
            case "Top Rated TV Shows":
              endpoint = `/${typePath}/top_rated`;
              break;

            default:
              endpoint = `/trending/${typePath}/day`;
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
        setTotalPages(response.data.total_pages || 1);
      } catch (err) {
        if (controller.signal.aborted || err.code === "ERR_CANCELED") {
          return;
        }

        console.error("Error fetching content:", err);

        setMovies([]);
        setTotalPages(1);
        setError(
          err.response?.data?.status_message ||
          `Unable to load ${isTv ? "TV shows" : "movies"}. Please try again.`,
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMovies();

    return () => controller.abort();
  }, [pageNo, category, searchQuery, tmdbApiKey, isTv]);

  const defaultHeading = isTv ? "Trending TV Shows" : "Trending Movies";
  const heading = searchQuery.trim()
    ? `Search Results for "${searchQuery.trim()}"`
    : category === "Category"
      ? defaultHeading
      : category;

  return (
    <div className="@container p-2">
      <h2 className="mb-3 text-center text-lg font-bold">{heading}</h2>

      {loading && (
        <div className="flex min-h-40 flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-3 text-sm text-gray-500">
            Loading {isTv ? "TV shows" : "movies"}...
          </p>
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
            ? `No ${isTv ? "TV shows" : "movies"} found. Try a different search.`
            : `No ${isTv ? "TV shows" : "movies"} available right now.`}
        </p>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="flex flex-row flex-wrap justify-center sm:justify-start">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              title={movie.title || movie.name}
              poster_path={movie.poster_path}
              watchList={watchList}
              handleAddToWatchList={handleAddToWatchList}
              handleRemoveFromWatchList={handleRemoveFromWatchList}
              contentType={contentType}
            />
          ))}
        </div>
      )}

      {!loading && !error && movies.length > 0 && (
        <Pagination
          pageNo={pageNo}
          setPageNo={handlePageChange}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}

export default Movies;
