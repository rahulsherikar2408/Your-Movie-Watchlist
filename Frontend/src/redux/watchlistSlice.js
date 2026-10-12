import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../services/api";

const getErrorMessage = (error) => error.response?.data?.message || "Something went wrong.";

export const fetchWatchlist = createAsyncThunk(
    "watchlist/fetchWatchlist",
    async(_, { rejectWithValue }) => {
        try {
            const response = await api.get("/watchlist");
            return response.data.movies;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const addMovieToWatchlist = createAsyncThunk(
  "watchlist/addMovie",
  async (movie, { rejectWithValue }) => {
    try {
      const response = await api.post("/watchlist", movie);
      return response.data.movies;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeMovieFromWatchlist = createAsyncThunk(
  "watchlist/removeMovie",
  async (movieId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/watchlist/${movieId}`);
      return response.data.movies;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  movies: [],
  status: "idle",
  error: null,
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    clearWatchlist(state) {
      state.movies = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchlist.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.movies = action.payload;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to load watchlist.";
      })
      .addCase(addMovieToWatchlist.pending, (state) => {
        state.error = null;
      })
      .addCase(addMovieToWatchlist.fulfilled, (state, action) => {
        state.movies = action.payload;
        state.error = null;
      })
      .addCase(addMovieToWatchlist.rejected, (state, action) => {
        state.error = action.payload || "Unable to add movie.";
      })
      .addCase(removeMovieFromWatchlist.pending, (state) => {
        state.error = null;
      })
      .addCase(removeMovieFromWatchlist.fulfilled, (state, action) => {
        state.movies = action.payload;
        state.error = null;
      })
      .addCase(removeMovieFromWatchlist.rejected, (state, action) => {
        state.error = action.payload || "Unable to remove movie.";
      });
  },
});

export const { clearWatchlist } = watchlistSlice.actions;
export default watchlistSlice.reducer;