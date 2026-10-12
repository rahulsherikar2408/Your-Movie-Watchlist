import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function MovieCard({
  movie,
  title,
  poster_path,
  watchList,
  handleAddToWatchList,
  handleRemoveFromWatchList,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);

  const isInWatchlist = watchList.some((item) => item.id === movie.id);

  const handleWatchlistClick = async (event) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: "/watchlist" } },
      });
      return;
    }

    setSaving(true);

    try {
      if (isInWatchlist) {
        await handleRemoveFromWatchList(movie);
      } else {
        await handleAddToWatchList(movie);
      }
    } catch {
      // Redux stores the API error; keep the card interactive.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={() =>
        navigate(`/movieinfo/${movie.id}`, {
          state: { movie },
        })
      }
      className="m-3 flex h-[27vh] w-[130px] cursor-pointer flex-col items-end justify-between rounded-xl bg-cover bg-center duration-300 hover:scale-110 sm:h-[40vh] sm:w-[165px]"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original${poster_path || ""})`,
      }}
    >
      <button
        type="button"
        disabled={saving}
        onClick={handleWatchlistClick}
        aria-label={
          isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
        }
        title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        className="m-2 flex h-6 w-6 items-center justify-center rounded-md bg-gray-900/70 text-sm text-white disabled:opacity-50"
      >
        {saving ? "…" : isInWatchlist ? "✕" : "♥"}
      </button>

      <div className="w-full rounded-b-2xl bg-gray-900/70 p-1.5 text-center text-sm text-white">
        {title}
      </div>
    </div>
  );
}

export default MovieCard;
