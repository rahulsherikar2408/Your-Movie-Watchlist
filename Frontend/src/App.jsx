import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Banner from "./components/Banner";
import MovieInfo from "./components/MovieInfo";
import Movies from "./components/Movies";
import Navbar from "./components/Navbar";
import Watchlist from "./components/Watchlist";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";


import { useAuth } from "./context/authContext";
import { useToast } from "./context/ToastContext";
import {
  fetchWatchlist,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  clearWatchlist,
} from "./redux/watchlistSlice";

function App() {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const watchList = useSelector((state) => state.watchlist.movies);

  const [contentType, setContentType] = useState(() => {
    return localStorage.getItem("contentType") || "movie";
  });
  const [category, setCategory] = useState("Category");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageNo, setPageNo] = useState(1);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPageNo(1);
  };

  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    localStorage.setItem("contentType", newType);
    setCategory("Category");
    setSearchQuery("");
    setPageNo(1);
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

  const handleAddToWatchList = async (movie) => {
    if (!user) {
      return;
    }
    const movieTitle = movie.title || movie.name || "Title";
    try {
      await dispatch(addMovieToWatchlist(movie)).unwrap();
      toast.success(`Added "${movieTitle}" to your watchlist!`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to add to watchlist.");
      throw err;
    }
  };

  const handleRemoveFromWatchList = async (movie) => {
    if (!user) {
      return;
    }
    const movieTitle = movie.title || movie.name || "Title";
    try {
      await dispatch(removeMovieFromWatchlist(movie.id)).unwrap();
      toast.info(`Removed "${movieTitle}" from your watchlist.`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to remove from watchlist.");
      throw err;
    }
  };

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-gray-50/50 text-gray-900 text-base">
        <Navbar
          contentType={contentType}
          onContentTypeChange={handleContentTypeChange}
          category={category}
          setCategory={handleCategoryChange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1">
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
                    pageNo={pageNo}
                    setPageNo={setPageNo}
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
                <div className="flex min-h-[50vh] flex-col items-center justify-center p-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                    <i className="fa-solid fa-triangle-exclamation text-3xl" />
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-900">
                    404 — Page Not Found
                  </h1>
                  <p className="mt-2 text-base text-gray-500">
                    The page you are looking for does not exist or has been moved.
                  </p>
                </div>
              }
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
