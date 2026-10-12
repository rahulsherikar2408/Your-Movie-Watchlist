import React from "react";
import Watchlist from "./Watchlist";
import { useNavigate } from "react-router-dom";

function MovieCard({
  movie,
  title,
  poster_path,
  watchList,
  handleAddToWatchList,
  handleRemoveFromWatchList,
}) {
  const navigate = useNavigate();

  function doesContains() {
    for (let i = 0; i < watchList.length; i++) {
      if (watchList[i].id === movie.id) {
        return true;
      }
    }
    return false;
  }

  return (
    <div
      onClick={() => navigate(`/movieinfo/${movie.id}`, { state: { movie } })}
      className="h-[27vh] w-[130px] sm:h-[40vh] sm:w-[165px] m-3 rounded-xl bg-cover bg-center flex items-end flex-col justify-between hover:scale-110 duration-300 hover:cursor-pointer"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original${poster_path})`,
      }}
    >
      {doesContains(movie) ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveFromWatchList(movie);
          }}
          className="m-2 flex justify-center h-5 w-5 text-xs rounded-sm sm:h-6 sm:w-6 sm:text-sm sm:rounded-md items-center bg-gray-900/60 "
        >
          &#10060;
        </div>
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleAddToWatchList(movie);
          }}
          className="m-2 flex justify-center h-5 w-5 text-xs rounded-sm sm:h-6 sm:w-6 sm:text-sm sm:rounded-md items-center bg-gray-900/60 "
        >
          &#128525;
        </div>
      )}
      <div className="w-full text-white text-sm sm:text-md p-1.5 text-center bg-gray-900/60 rounded-b-2xl">
        {title}
      </div>
    </div>
  );
}

export default MovieCard;
