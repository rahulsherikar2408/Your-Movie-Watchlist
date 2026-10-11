import React, { useState ,useEffect } from 'react'
import MovieCard from './MovieCard'
import axios from 'axios'
import Pagination from './Pagination';

function Movies({ searchQuery, watchList, category, handleAddToWatchList, handleRemoveFromWatchList }) {

  const [movies, setMovies] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState();

  // Taking api key from .env file
  const tmdb_api_key = import.meta.env.VITE_TMDB_API_KEY;


  const getTrendingMoviesData = async() => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdb_api_key}&language=en-US&page=${pageNo}`);
      console.log(response.data.results)
      setTotalPages(response.data.total_pages)
      setMovies(response.data.results)
    } catch (error) {
      console.log("Error fetching data from API:", error);
    }
  }

  const getPopularMoviesData = async() => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${tmdb_api_key}&language=en-US&page=${pageNo}`);
      console.log(response.data.results)
      setTotalPages(response.data.total_pages)
      setMovies(response.data.results)
    } catch (error) {
      console.log("Error fetching data from API:", error);
    }
  }

  const getTopRatedMoviesData = async() => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${tmdb_api_key}&language=en-US&page=${pageNo}`);
      console.log(response.data.results)
      setTotalPages(response.data.total_pages)
      setMovies(response.data.results)
    } catch (error) {
      console.log("Error fetching data from API:", error);
    }
  }

  const getSearchResultsData = async() => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${tmdb_api_key}&query=${searchQuery.toLowerCase()}&include_adult=false&language=en-US&page=${pageNo}`);
      console.log(response.data.results)
      setTotalPages(response.data.total_pages)
      setMovies(response.data.results)
    } catch (error) {
      console.log("Error fetching data from API:", error);
    }
  }

  useEffect(() => {
    switch(category) {
      case 'Popular Movies':
        getPopularMoviesData();
        break;
      case 'Top Rated Movies':
        getTopRatedMoviesData();
        break;
      case `Search Results for ${searchQuery}`:
        console.log(searchQuery)
        getSearchResultsData();
        break;
      default:
        getTrendingMoviesData();
        break;
    }
  }, [pageNo,category])

  return (
    <div className='@container p-2'>
      <div className='text-md @min-[450px]:text-lg mb-3 font-bold text-center'>{category==='Category'?('Trending Movies'):category}</div>
      <div className='flex flex-row flex-wrap justify-center sm:justify-start'>{movies.map((movie) => {
          return <MovieCard key={movie.id} movie={movie} title={movie.title} poster_path={movie.poster_path} handleAddToWatchList = {handleAddToWatchList} handleRemoveFromWatchList={handleRemoveFromWatchList} watchList={watchList} />
        })}</div>
      <Pagination pageNo={pageNo} setPageNo={setPageNo} totalPages={totalPages}/>
    </div>
  )
}

export default Movies;
