import { useLocation, useNavigate, useParams } from "react-router";
import React, { useEffect, useState } from "react";
import axios from "axios";

function MovieInfo({ watchList, handleAddToWatchList, handleRemoveFromWatchList }) {

    const [movieData, setMovieData] = useState([])
    const movieId = useParams().id;
    const movie = useLocation().state?.movie;
    const navigate = useNavigate();

    function doesContains() {
        for (let i = 0; i < watchList.length; i++) {
            if (watchList[i].id === movieData.id) {
                return true;
            }
        }
        return false;
    }

    const getMovieInfoData = async () => {
        try {
            const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=a9fe70b9e2d00af74cda9df5cf32b8e4&language=en-US`);
            console.log(response.data);
            setMovieData(response.data);
        }
        catch (error) {
            console.log("Error fetching movie data:", error);
        }
    }

    useEffect(() => {
        getMovieInfoData()
    }, [])

    return (
        <>
            {/* Back Button */}
            <div
                onClick={() => navigate(-1)}
                className="ml-4 sm:ml-12 mt-5 sm:mt-7 w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] rounded-full text-sm sm:text-md bg-gray-100 flex justify-center items-center hover:cursor-pointer hover:scale-110 duration-200"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </div>

            {/* Main Container */}
            <div className="m-5 sm:mx-10 mt-4 flex flex-col sm:flex-row justify-center sm:items-start gap-6">

                {/* Left Side - Poster + Button */}
                <div className="flex flex-col justify-center items-center">
                    <img
                        className="w-[200px] h-[300px] sm:w-[270px] sm:h-[380px] rounded-xl object-cover"
                        src={`https://image.tmdb.org/t/p/original${movieData.poster_path}`}
                        alt={movieData.title}
                    />

                    {doesContains() ? (
                        <button
                            onClick={() => handleRemoveFromWatchList(movie)}
                            className="w-[200px] sm:w-[270px] h-[40px] sm:h-[45px] mt-3 bg-red-500/90 text-white font-bold text-sm sm:text-md rounded-lg cursor-pointer transform transition-all duration-300"
                        >
                            Delete From Watchlist
                        </button>
                    ) : (
                        <button
                            onClick={() => handleAddToWatchList(movie)}
                            className="w-[200px] sm:w-[270px] h-[40px] sm:h-[45px] mt-3 bg-green-500/90 text-white font-bold text-sm sm:text-md rounded-lg cursor-pointer transform transition-all duration-300"
                        >
                            Add To Watchlist
                        </button>
                    )}
                </div>

                {/* Right Side - Info */}
                <div className="w-full sm:w-[600px] flex flex-col items-start gap-3">
                    <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left mt-3 sm:mt-5">
                        {movieData.title}
                    </h1>

                    <p className="text-sm sm:text-lg -ml-1">
                        <i
                            className="fa-solid fa-star fa-lg"
                            style={{ color: "#FFD43B" }}
                        ></i>{" "}
                        {Math.round(movieData.vote_average * 10) / 10}/10 - Votes:
                        {movieData.vote_count}
                    </p>

                    <ul className="flex flex-row flex-wrap justify-start items-start list-disc ml-4 sm:ml-5 gap-7 sm:gap-12 text-sm sm:text-lg">
                        {movieData.genres?.map((genre) => (
                            <li key={genre.id}>{genre.name}</li>
                        ))}
                    </ul>

                    <p className="text-sm sm:text-lg leading-relaxed">
                        {movieData.overview}
                    </p>
                </div>
            </div>
        </>


    )
}

export default MovieInfo;

