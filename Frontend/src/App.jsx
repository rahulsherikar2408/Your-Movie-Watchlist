import Banner from "./components/Banner";
import MovieInfo from "./components/MovieInfo";
import Movies from "./components/Movies";
import Navbar from "./components/Navbar";
import Watchlist from "./components/Watchlist";
import React, { useEffect } from "react";
import { useState } from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

function App() {

  const [watchList, setWatchList] = useState([]);
  const [category, setCategory] = useState("Category");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddToWatchList = (movie) => {
    const newWatchList = [...watchList, movie];
    localStorage.setItem("movies", JSON.stringify(newWatchList))
    setWatchList(newWatchList);
    console.log(newWatchList)
  }

  const handleRemoveFromWatchList = (movie) => {
    const filteredWatchList = watchList.filter((item) => item.id !== movie.id);
    localStorage.setItem("movies", JSON.stringify(filteredWatchList))
    setWatchList(filteredWatchList);
  }

  useEffect(() => {
    const moviesFromLocalStorage = localStorage.getItem("movies");
    if(!moviesFromLocalStorage){
      return 
    }
    setWatchList(JSON.parse(moviesFromLocalStorage))
  },[])

  return (
    <>
      <Router>
        <Navbar category={category} setCategory={setCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Routes>
          <Route path='/' element={<> <Banner/> <Movies searchQuery={searchQuery} category={category} watchList={watchList} handleAddToWatchList={handleAddToWatchList} handleRemoveFromWatchList={handleRemoveFromWatchList}/> </>} />
          <Route path='/watchlist' element={<Watchlist watchList={watchList} setWatchList={setWatchList} handleRemoveFromWatchList={handleRemoveFromWatchList}/>} />
          <Route path='/movieinfo/:id' element={<MovieInfo watchList={watchList} setWatchList={setWatchList} handleAddToWatchList={handleAddToWatchList} handleRemoveFromWatchList={handleRemoveFromWatchList} />}/>
          <Route path='*' element={<h1>404 Not Found</h1>} />
        </Routes>
      </Router>
    </>
  );
}

export default App