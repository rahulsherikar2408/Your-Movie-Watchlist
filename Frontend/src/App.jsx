import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Banner from "./components/Banner";
import MovieInfo from "./components/MovieInfo";
import Movies from "./components/Movies";
import Navbar from "./components/Navbar";
import Watchlist from "./components/Watchlist";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";

import { useAuth } from "./context/AuthContext";
import {
  fetchWatchlist,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  clearWatchlist,
} from "./redux/watchlistSlice";
import { useRef } from "react";

function App() {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useAuth();

  const watchList = useSelector((state) => state.watchlist.movies);

  const [contentType, setContentType] = useState(() => {
    return localStorage.getItem("contentType") || "movie";
  });
  const [category, setCategory] = useState("Category");
  const [searchQuery, setSearchQuery] = useState("");

  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    localStorage.setItem("contentType", newType);
    setCategory("Category");
    setSearchQuery("");
  };

  const loaderUserId = useRef(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      loaderUserId.current = null;
      dispatch(clearWatchlist());
      return;
    }

    const userId = user.id || user._id;

    if (!userId || loaderUserId.current === userId) {
      return;
    }

    loaderUserId.current = userId;
    dispatch(fetchWatchlist());
  }, [user, authLoading, dispatch]);

  const handleAddToWatchList = (movie) => {
    if (!user) {
      return;
    }
    dispatch(addMovieToWatchlist(movie));
  };

  const handleRemoveFromWatchList = (movie) => {
    if (!user) {
      return;
    }
    dispatch(removeMovieFromWatchlist(movie.id));
  };

  return (
    <>
      <Router>
        <Navbar
          contentType={contentType}
          onContentTypeChange={handleContentTypeChange}
          category={category}
          setCategory={setCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Banner />
                <Movies
                  contentType={contentType}
                  searchQuery={searchQuery}
                  category={category}
                  watchList={watchList}
                  handleAddToWatchList={handleAddToWatchList}
                  handleRemoveFromWatchList={handleRemoveFromWatchList}
                />
              </>
            }
          />

          <Route
            path="/movieinfo/:id"
            element={
              <MovieInfo
                contentType={contentType}
                watchList={watchList}
                handleAddToWatchList={handleAddToWatchList}
                handleRemoveFromWatchList={handleRemoveFromWatchList}
              />
            }
          />

          {/* Authentication pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/watchlist"
              element={
                <Watchlist
                  watchList={watchList}
                  handleRemoveFromWatchList={handleRemoveFromWatchList}
                />
              }
            />
          </Route>

          <Route
            path="*"
            element={
              <div className="p-10 text-center text-2xl font-bold">
                404 — Page Not Found
              </div>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
