import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import { useSelector } from "react-redux";

import genreIds from "../utility/genre";

function Watchlist({ handleRemoveFromWatchList }) {
  const {
    movies: watchList,
    status,
    error,
  } = useSelector((state) => state.watchlist);

  const [search, setSearch] = useState("");
  const [currGenre, setCurrGenre] = useState("All Genres");
  const [sortOrder, setSortOrder] = useState("none");

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
      result.sort((a, b) => a.vote_average - b.vote_average);
    } else if (sortOrder === "descending") {
      result.sort((a, b) => b.vote_average - a.vote_average);
    }

    return result;
  }, [watchList, search, currGenre, sortOrder]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">My Watchlist</h1>

      {status === "loading" && (
        <p className="py-8 text-center text-gray-500">
          Loading your watchlist...
        </p>
      )}

      {status === "failed" && (
        <p role="alert" className="py-4 text-center text-red-600">
          {error || "Unable to load your watchlist."}
        </p>
      )}

      {status !== "loading" && status !== "failed" && (
        <>
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            {genreList.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setCurrGenre(genre)}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  currGenre === genre
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your movies..."
              aria-label="Search watchlist"
              className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
            />

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-label="Sort movies by rating"
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="none">Default order</option>
              <option value="ascending">Rating: Low to High</option>
              <option value="descending">Rating: High to Low</option>
            </select>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-semibold text-gray-700">
                {watchList.length === 0
                  ? "Your watchlist is empty."
                  : "No movies match your filters."}
              </p>

              {watchList.length === 0 && (
                <Link
                  to="/"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
                >
                  Discover Movies
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full min-w-[650px] text-left text-sm text-gray-700">
                <thead className="bg-gray-100 uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Movie</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Popularity</th>
                    <th className="px-4 py-3">Genre</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMovies.map((movie) => (
                    <tr
                      key={movie.id}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/movieinfo/${movie.id}`}
                          state={{
                            movie,
                            contentType: movie.first_air_date ? "tv" : "movie",
                          }}
                          className="flex items-center gap-4 font-semibold hover:text-blue-600"
                        >
                          <img
                            src={
                              movie.poster_path
                                ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
                                : ""
                            }
                            alt={movie.title || movie.name}
                            className="h-20 w-14 rounded object-cover"
                          />
                          {movie.title || movie.name}
                        </Link>
                      </td>

                      <td className="px-4 py-3">
                        {Number(movie.vote_average || 0).toFixed(1)}
                      </td>

                      <td className="px-4 py-3">
                        {Math.round(movie.popularity || 0)}
                      </td>

                      <td className="px-4 py-3">
                        {(movie.genre_ids || [])
                          .map((id) => genreIds[id])
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveFromWatchList(movie)}
                          className="font-semibold text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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
