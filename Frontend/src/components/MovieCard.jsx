import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

function MovieCard({
  movie,
  title,
  poster_path,
  watchList = [],
  handleAddToWatchList,
  handleRemoveFromWatchList,
  contentType = "movie",
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isInWatchlist = watchList.some((item) => Number(item.id) === Number(movie.id));

  const displayTitle = title || movie.title || movie.name || "Untitled";
  const displayReleaseDate = movie.release_date || movie.first_air_date || "";
  const releaseYear = displayReleaseDate ? displayReleaseDate.slice(0, 4) : "";
  const rating =
    movie.vote_average && movie.vote_average > 0
      ? Number(movie.vote_average).toFixed(1)
      : null;

  const resolvedContentType = movie.first_air_date ? "tv" : contentType;

  const handleCardClick = () => {
    navigate(`/movieinfo/${movie.id}`, {
      state: {
        movie: {
          ...movie,
          title: displayTitle,
          release_date: displayReleaseDate,
        },
        contentType: resolvedContentType,
      },
    });
  };

  const handleWatchlistClick = async (event) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: "/watchlist" } },
      });
      return;
    }

    setSaving(true);

    const normalizedMovie = {
      ...movie,
      title: displayTitle,
      release_date: displayReleaseDate,
    };

    try {
      if (isInWatchlist) {
        await handleRemoveFromWatchList?.(normalizedMovie);
      } else {
        await handleAddToWatchList?.(normalizedMovie);
      }
    } catch {
      // Handled via toastr in App.jsx
    } finally {
      setSaving(false);
    }
  };

  const posterUrl =
    poster_path && !imageError
      ? `https://image.tmdb.org/t/p/w500${poster_path}`
      : null;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex aspect-[2/3] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-gray-900 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl border border-gray-800/40"
    >
      {/* Poster Image or Placeholder */}
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={displayTitle}
          loading="lazy"
          onError={() => setImageError(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950 p-4 text-center text-gray-400">
          <i className="fa-solid fa-film text-3xl text-gray-600 mb-2" />
          <span className="text-sm font-semibold text-gray-300 line-clamp-2">
            {displayTitle}
          </span>
        </div>
      )}

      {/* Top Overlay: Badges and Watchlist Toggle */}
      <div className="relative z-10 flex w-full items-start justify-between p-3">
        {/* Rating Badge */}
        {rating ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-400 backdrop-blur-md border border-white/10 shadow-sm">
            <i className="fa-solid fa-star text-xs" />
            <span>{rating}</span>
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-gray-200 backdrop-blur-md border border-white/10">
            {resolvedContentType === "tv" ? "TV" : "Movie"}
          </span>
        )}

        {/* Watchlist Heart Button with Spinner */}
        <button
          type="button"
          disabled={saving}
          onClick={handleWatchlistClick}
          aria-label={
            isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
          }
          title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-md transition-all hover:bg-black hover:scale-110 active:scale-95 disabled:opacity-75 shadow-md border border-white/10"
        >
          {saving ? (
            <i className="fa-solid fa-spinner animate-spin text-sm text-blue-400" />
          ) : isInWatchlist ? (
            <i className="fa-solid fa-heart text-base text-red-500 transition-colors" />
          ) : (
            <i className="fa-regular fa-heart text-base text-gray-200 hover:text-red-400 transition-colors" />
          )}
        </button>
      </div>

      {/* Bottom Gradient and Info */}
      <div className="relative z-10 flex flex-col justify-end bg-gradient-to-t from-gray-950 via-gray-950/85 to-transparent px-3.5 pt-14 pb-3.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 mb-1 font-medium">
          {releaseYear && <span>{releaseYear}</span>}
          {releaseYear && <span>•</span>}
          <span className="uppercase text-xs tracking-wider font-bold text-blue-400">
            {resolvedContentType === "tv" ? "TV Series" : "Movie"}
          </span>
        </div>

        <h3
          className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors"
          title={displayTitle}
        >
          {displayTitle}
        </h3>
      </div>
    </div>
  );
}

export default MovieCard;
