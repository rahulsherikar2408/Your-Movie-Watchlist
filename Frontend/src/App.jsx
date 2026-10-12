import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Banner from "./components/Banner";
import MovieInfo from "./components/MovieInfo";
import Movies from "./components/Movies";
import Navbar from "./components/Navbar";
import Watchlist from "./components/Watchlist";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const [watchList, setWatchList] = useState([]);
  const [category, setCategory] = useState("Category");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddToWatchList = (movie) => {
    setWatchList((currentList) => {
      if (currentList.some((item) => item.id === movie.id)) {
        return currentList;
      }

      const updatedList = [...currentList, movie];
      localStorage.setItem("movies", JSON.stringify(updatedList));

      return updatedList;
    });
  };

  const handleRemoveFromWatchList = (movie) => {
    setWatchList((currentList) => {
      const updatedList = currentList.filter((item) => item.id !== movie.id);

      localStorage.setItem("movies", JSON.stringify(updatedList));

      return updatedList;
    });
  };

  useEffect(() => {
    try {
      const storedMovies = localStorage.getItem("movies");

      if (storedMovies) {
        const parsedMovies = JSON.parse(storedMovies);

        if (Array.isArray(parsedMovies)) {
          setWatchList(parsedMovies);
        }
      }
    } catch {
      localStorage.removeItem("movies");
    }
  }, []);

  return (
    <>
      <Router>
        <Navbar
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
                watchList={watchList}
                setWatchList={setWatchList}
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
                  setWatchList={setWatchList}
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
