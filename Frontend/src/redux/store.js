import { configureStore } from "@reduxjs/toolkit";

import watchlistReducer from "./watchlistSlice.js";

export const store = configureStore({
  reducer: {
    watchlist: watchlistReducer,
  },
});
