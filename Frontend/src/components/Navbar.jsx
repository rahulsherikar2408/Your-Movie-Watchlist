import React, { useState } from "react";
import movieLogo from "../assets/image.png";
import { Link } from "react-router-dom";

function Navbar({ category, setCategory, searchQuery, setSearchQuery }) {
  const [open, setOpen] = useState(false); // dropdown state
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setOpen(false); // close dropdown after selecting
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="@container flex items-center w-full h-[50px] px-4 sm:px-6 sticky top-0 z-50 
      bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
      <div className="flex @max-[740px]:justify-between items-center w-full">
        {/* Left - Logo */}
        <div className="flex items-center space-x-3 @min-[740px]:mr-10">
          <img
            className="w-8 h-8 rounded-lg shadow-md"
            src={movieLogo}
            alt="movie"
          />
          <Link
            to="/"
            onClick={() => window.location.reload()}
            className="text-blue-500 font-extrabold md:mr-10 text-lg sm:text-xl hover:text-blue-600 transition"
          >
            Movies
          </Link>
        </div>

        {/* Center - Nav Links (hidden on small screens) */}
        <div className="hidden md:flex justify-center items-center space-x-8">
          <Link
            to="/"
            className="text-gray-700 text-md font-semibold hover:text-blue-500 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/watchlist"
            className="text-gray-700 text-md font-semibold hover:text-blue-500 transition-colors"
          >
            Watchlist
          </Link>

          {/* Dropdown */}
          <div className="relative">
            <div
              onClick={() => setOpen(!open)}
              className="flex justify-center items-center cursor-pointer"
            >
              <div className="text-md text-gray-700 font-semibold hover:text-blue-500">
                Category
              </div>
              <i
                className={`fa-solid fa-chevron-${open ? "up" : "down"} mt-1`}
              ></i>
            </div>

            {/* Dropdown Menu */}
            {open && (
              <ul className="absolute mt-2 bg-white shadow-lg rounded-lg w-48 p-2 z-50">
                {["Trending Movies", "Popular Movies", "Top Rated Movies"].map(
                  (cat) => (
                    <li
                      key={cat}
                      onClick={() => {
                        handleSelect(cat);
                        setOpen(false);
                      }}
                      className="text-md text-gray-700 font-semibold hover:text-blue-500 cursor-pointer p-2"
                    >
                      {cat}
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Search Bar (always visible, responsive) */}
        <div className="flex items-center @max-[432px]:w-[110px] sm:w-auto ml-3 sm:ml-6 h-[35px] rounded-full border border-blue-500 font-semibold text-gray-700 bg-white/80 backdrop-blur-md overflow-hidden">
          <input
            onChange={handleSearch}
            value={searchQuery}
            type="text"
            placeholder="Search Something..."
            className="flex-1 @max-[432px]:w-[70px] w-[190px] h-full px-3 outline-none border-none text-sm sm:text-base bg-transparent"
          />
          <button
            type="button"
            onClick={() => handleSelect(`Search Results for ${searchQuery}`)}
            className="w-10 h-[27px] flex justify-center items-center bg-blue-600 hover:bg-blue-700 cursor-pointer transition-all text-white text-sm rounded-full m-1"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>

        {/* Right - Mobile Hamburger (visible on small screens) */}
        <div
          className="md:hidden text-2xl cursor-pointer ml-3"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className="fa-solid fa-bars"></i>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-[49px] left-0 w-full bg-white shadow-lg z-50 flex flex-col space-y-4 p-4 md:hidden">
            <Link
              to="/"
              className="text-gray-700 text-md font-semibold hover:text-blue-500"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/watchlist"
              className="text-gray-700 text-md font-semibold hover:text-blue-500"
              onClick={() => setMenuOpen(false)}
            >
              Watchlist
            </Link>

            {/* Mobile Dropdown */}
            <div className="relative">
              <div
                onClick={() => setOpen(!open)}
                className="flex justify-between items-center cursor-pointer"
              >
                <div className="text-md text-gray-700 font-semibold">
                  Category
                </div>
                <i
                  className={`fa-solid fa-chevron-${open ? "up" : "down"}`}
                ></i>
              </div>
              {open && (
                <ul className="mt-2 bg-white rounded-lg w-full p-2">
                  {["Trending Movies", "Popular Movies", "Top Rated Movies"].map(
                    (cat) => (
                      <li
                        key={cat}
                        onClick={() => {
                          handleSelect(cat);
                          setOpen(false);
                          setMenuOpen(false);
                        }}
                        className="text-md text-gray-700 font-semibold hover:text-blue-500 cursor-pointer p-2"
                      >
                        {cat}
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

export default Navbar;
