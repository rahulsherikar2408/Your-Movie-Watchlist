import Watchlist from "../models/watchlist.js";

const getOrCreateWatchlist = async (userId) => {
  let watchlist = await Watchlist.findOne({ user: userId });

  if (!watchlist) {
    watchlist = await Watchlist.create({
      user: userId,
      movies: [],
    });
  }

  return watchlist;
};

// GET /api/watchlist
export const getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await getOrCreateWatchlist(req.user.id);

    return res.status(200).json({
      success: true,
      movies: watchlist.movies,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/watchlist
export const addMovie = async (req, res, next) => {
  try {
    const movie = req.body;

    if (
      !movie ||
      !Number.isSafeInteger(movie.id) ||
      movie.id <= 0 ||
      typeof movie.title !== "string" ||
      !movie.title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid movie ID and title are required.",
      });
    }

    const watchlist = await getOrCreateWatchlist(req.user.id);

    const alreadyExists = watchlist.movies.some((item) => item.id === movie.id);

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Movie is already in your watchlist.",
      });
    }

    const safeMovie = {
      id: movie.id,
      title: movie.title.trim(),
      poster_path:
        typeof movie.poster_path === "string" ? movie.poster_path : null,
      vote_average: Number.isFinite(movie.vote_average)
        ? movie.vote_average
        : 0,
      popularity: Number.isFinite(movie.popularity) ? movie.popularity : 0,
      genre_ids: Array.isArray(movie.genre_ids)
        ? movie.genre_ids.filter(Number.isSafeInteger)
        : [],
      overview: typeof movie.overview === "string" ? movie.overview : "",
      release_date:
        typeof movie.release_date === "string" ? movie.release_date : "",
    };

    watchlist.movies.push(safeMovie);
    await watchlist.save();

    return res.status(201).json({
      success: true,
      message: "Movie added to your watchlist.",
      movies: watchlist.movies,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/watchlist/:movieId
export const removeMovie = async (req, res, next) => {
  try {
    const movieId = Number(req.params.movieId);

    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID.",
      });
    }

    const watchlist = await Watchlist.findOne({
      user: req.user.id,
    });

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: "Watchlist not found.",
      });
    }

    const existingLength = watchlist.movies.length;

    watchlist.movies = watchlist.movies.filter((movie) => movie.id !== movieId);

    if (watchlist.movies.length === existingLength) {
      return res.status(404).json({
        success: false,
        message: "Movie was not found in your watchlist.",
      });
    }

    await watchlist.save();

    return res.status(200).json({
      success: true,
      message: "Movie removed from your watchlist.",
      movies: watchlist.movies,
    });
  } catch (error) {
    next(error);
  }
};
