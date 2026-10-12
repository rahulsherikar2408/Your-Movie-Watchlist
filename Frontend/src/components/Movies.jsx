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

    // Smooth scroll up to top of movies grid
    window.scrollTo({ top: 380, behavior: "smooth" });
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

  const getHeadingIcon = () => {
    if (searchQuery.trim()) return "fa-magnifying-glass text-blue-600";
    if (category.includes("Popular")) return "fa-fire text-amber-500";
    if (category.includes("Top Rated")) return "fa-award text-yellow-500";
    return "fa-bolt text-blue-600";
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
            <i className={`fa-solid ${getHeadingIcon()} text-lg`} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              {heading}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {isTv ? "Explore top rated and trending television series" : "Explore popular and trending cinema"}
            </p>
          </div>
        </div>

        {!loading && !error && movies.length > 0 && (
          <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-bold text-gray-700">
            Page {pageNo} of {totalPages}
          </span>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="relative aspect-[2/3] w-full animate-pulse rounded-2xl bg-gray-200 flex flex-col justify-between p-3"
            >
              <div className="flex justify-between">
                <div className="h-6 w-14 rounded-full bg-gray-300" />
                <div className="h-8 w-8 rounded-full bg-gray-300" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-gray-300" />
                <div className="h-5 w-full rounded bg-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="my-10 flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 p-8 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <i className="fa-solid fa-triangle-exclamation text-2xl" />
          </div>
          <p role="alert" className="max-w-md text-base font-semibold text-red-700">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setPageNo((page) => page)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <i className="fa-solid fa-rotate-right" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && movies.length === 0 && (
        <div className="my-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <i className="fa-solid fa-film text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">
            {searchQuery.trim()
              ? `No ${isTv ? "TV shows" : "movies"} found`
              : `No titles available`}
          </h3>
          <p className="mt-2 max-w-sm text-base text-gray-500">
            {searchQuery.trim()
              ? `We couldn't find any matches for "${searchQuery.trim()}". Try checking your spelling or searching for another title.`
              : `No ${isTv ? "TV shows" : "movies"} are available in this section right now.`}
          </p>
        </div>
      )}

      {/* Movies Grid */}
      {!loading && !error && movies.length > 0 && (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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

      {/* Pagination Controls */}
      {!loading && !error && movies.length > 0 && (
        <div className="mt-8">
          <Pagination
            pageNo={pageNo}
            setPageNo={handlePageChange}
            totalPages={totalPages}
          />
        </div>
      )}
    </section>
  );
}

export default Movies;
