import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import genreIds from "../utility/genre";
import MovieCard from "./MovieCard";

function Watchlist({ handleRemoveFromWatchList }) {
  const {
    movies: watchList,
    status,
    error,
  } = useSelector((state) => state.watchlist);

  const [search, setSearch] = useState("");
  const [currGenre, setCurrGenre] = useState("All Genres");
  const [sortOrder, setSortOrder] = useState("none");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [deletingId, setDeletingId] = useState(null);

  const genreList = useMemo(() => {
    const genres = watchList
      .flatMap((movie) => movie.genre_ids || [])
      .map((id) => genreIds[id])
      .filter(Boolean);

    return ["All Genres", ...new Set(genres)];
  }, [watchList]);

  const filteredMovies = useMemo(() => {
    const result = watchList
      .filter((movie) =>
        (movie.title || movie.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
      .filter(
        (movie) =>
          currGenre === "All Genres" ||
          (movie.genre_ids || []).some((id) => genreIds[id] === currGenre),
      );

    if (sortOrder === "ascending") {
      result.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
    } else if (sortOrder === "descending") {
      result.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    }

    return result;
  }, [watchList, search, currGenre, sortOrder]);

  const avgRating = useMemo(() => {
    if (!watchList.length) return null;
    const total = watchList.reduce((acc, m) => acc + (m.vote_average || 0), 0);
    return (total / watchList.length).toFixed(1);
  }, [watchList]);

  const handleDelete = async (movie) => {
    setDeletingId(movie.id);
    try {
      await handleRemoveFromWatchList?.(movie);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title & Stats */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <i className="fa-solid fa-bookmark text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              My Watchlist
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Manage and organize your saved cinema and series
            </p>
          </div>
        </div>

        {watchList.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-sm font-bold text-blue-700 border border-blue-100">
              <i className="fa-solid fa-film text-xs" />
              {watchList.length} {watchList.length === 1 ? "Title" : "Titles"}
            </span>

            {avgRating && (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-sm font-bold text-amber-700 border border-amber-200/60">
                <i className="fa-solid fa-star text-xs text-amber-500" />
                {avgRating} Avg
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading state */}
      {status === "loading" && (
        <div className="flex min-h-[35vh] flex-col items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="mt-4 text-base text-gray-600 font-semibold">
            Loading your watchlist...
          </p>
        </div>
      )}

      {/* Error state */}
      {status === "failed" && (
        <div className="my-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
          <i className="fa-solid fa-circle-exclamation text-3xl text-red-500 mb-2" />
          <p role="alert" className="text-base font-bold">
            {error || "Unable to load your watchlist."}
          </p>
        </div>
      )}

      {status !== "loading" && status !== "failed" && (
        <>
          {watchList.length > 0 && (
            <>
              {/* Filter Pills */}
              <div className="mb-6 flex flex-wrap items-center gap-2.5">
                {genreList.map((genre) => {
                  const isSelected = currGenre === genre;
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setCurrGenre(genre)}
                      className={`rounded-full px-4.5 py-2 text-sm font-bold transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 ring-2 ring-blue-600 ring-offset-1"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>

              {/* Search, Sort & View Mode Controls */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  {/* Search input */}
                  <div className="relative w-full sm:max-w-sm">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search watchlist..."
                      aria-label="Search watchlist"
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-9 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Sort select */}
                  <div className="relative">
                    <select
                      value={sortOrder}
                      onChange={(event) => setSortOrder(event.target.value)}
                      aria-label="Sort movies by rating"
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm sm:text-base font-semibold text-gray-700 outline-none transition focus:border-blue-500 shadow-sm cursor-pointer"
                    >
                      <option value="none">Default order</option>
                      <option value="descending">Rating: High to Low</option>
                      <option value="ascending">Rating: Low to High</option>
                    </select>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 border border-gray-200/80 shadow-inner self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    aria-label="Table View"
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold transition ${
                      viewMode === "table"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <i className="fa-solid fa-list text-sm" />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid View"
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold transition ${
                      viewMode === "grid"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <i className="fa-solid fa-border-all text-sm" />
                    <span>Grid</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Empty / Filter Mismatch State */}
          {filteredMovies.length === 0 ? (
            <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 shadow-inner">
                <i className="fa-solid fa-bookmark text-3xl" />
              </div>

              <h2 className="text-2xl font-black text-gray-900">
                {watchList.length === 0
                  ? "Your watchlist is empty"
                  : "No matches found"}
              </h2>

              <p className="mt-2 max-w-md text-base text-gray-500">
                {watchList.length === 0
                  ? "Save movies and TV shows you want to watch later by clicking the heart button on any title."
                  : "Try clearing your search query or picking a different genre filter."}
              </p>

              {watchList.length === 0 ? (
                <Link
                  to="/"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
                >
                  <i className="fa-solid fa-compass" />
                  <span>Explore Trending Titles</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCurrGenre("All Genres");
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-300 transition"
                >
                  <i className="fa-solid fa-rotate-left" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  title={movie.title || movie.name}
                  poster_path={movie.poster_path}
                  watchList={watchList}
                  handleAddToWatchList={() => {}}
                  handleRemoveFromWatchList={handleRemoveFromWatchList}
                  contentType={movie.first_air_date ? "tv" : "movie"}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[750px] text-left text-base text-gray-700">
                <thead className="bg-gray-50/80 text-sm font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">Title</th>
                    <th className="px-5 py-4">Rating</th>
                    <th className="px-5 py-4">Popularity</th>
                    <th className="px-5 py-4">Genres</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredMovies.map((movie) => {
                    const isDeleting = deletingId === movie.id;

                    return (
                      <tr
                        key={movie.id}
                        className="group transition hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-4">
                          <Link
                            to={`/movieinfo/${movie.id}`}
                            state={{
                              movie,
                              contentType: movie.first_air_date ? "tv" : "movie",
                            }}
                            className="flex items-center gap-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors"
                          >
                            <img
                              src={
                                movie.poster_path
                                  ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
                                  : "https://placehold.co/60x90?text=No+Poster"
                              }
                              alt={movie.title || movie.name}
                              loading="lazy"
                              className="h-20 w-14 shrink-0 rounded-xl object-cover shadow-sm transition group-hover:scale-105"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600">
                                {movie.title || movie.name}
                              </p>
                              <span className="text-sm font-medium text-gray-400">
                                {movie.release_date || movie.first_air_date || "Unknown"}
                              </span>
                            </div>
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700 border border-amber-200/50">
                            <i className="fa-solid fa-star text-xs text-amber-500" />
                            {Number(movie.vote_average || 0).toFixed(1)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm sm:text-base font-semibold text-gray-600">
                          {Math.round(movie.popularity || 0)} pts
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {(movie.genre_ids || [])
                              .map((id) => genreIds[id])
                              .filter(Boolean)
                              .slice(0, 3)
                              .map((genre) => (
                                <span
                                  key={genre}
                                  className="rounded-md bg-gray-100 px-2.5 py-1 text-xs sm:text-sm font-semibold text-gray-700"
                                >
                                  {genre}
                                </span>
                              )) || <span className="text-gray-400 text-sm">N/A</span>}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(movie)}
                            aria-label={`Remove ${movie.title || movie.name} from watchlist`}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2 text-sm font-bold text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <>
                                <i className="fa-solid fa-spinner animate-spin text-sm" />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <i className="fa-regular fa-trash-can text-sm" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Watchlist;
