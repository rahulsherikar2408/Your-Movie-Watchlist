import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext.js";
import movieLogo from "../assets/image.png";

const Navbar = ({ category, setCategory, searchQuery, setSearchQuery }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const categories = ["Trending Movies", "Popular Movies"];

  const handleCategoryClick = (selectedCategory) => {
    setCategory(selectedCategory);
    setCategoryOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/", { replace: true });
    } catch {
      alert("Unable to log out. Please try again.");
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setCategoryOpen(false);
  };

  const navLinkClass = (path) =>
    `transition-colors duration-200 hover:text-blue-600 ${
      location.pathname === path
        ? "font-bold text-blue-600"
        : "font-medium text-gray-700"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-2"
          >
            <img
              src={movieLogo}
              alt="Movie Watchlist"
              className="h-10 w-10 rounded-full object-cover"
            />

            <span className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">
              Movie<span className="text-blue-600">Watchlist</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/" className={navLinkClass("/")}>
              Home
            </Link>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryOpen((open) => !open)}
                aria-expanded={categoryOpen}
                className="flex items-center gap-1 font-medium text-gray-700 transition hover:text-blue-600"
              >
                {category === "Category" ? "Categories" : category}

                <svg
                  className={`h-4 w-4 transition-transform ${
                    categoryOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 7.22a.75.75 0 011.06 0L10 10.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {categoryOpen && (
                <div className="absolute left-0 top-full mt-3 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleCategoryClick(item)}
                      className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-blue-50 hover:text-blue-600 ${
                        category === item
                          ? "bg-blue-50 font-semibold text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/watchlist" className={navLinkClass("/watchlist")}>
              Watchlist
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden flex-1 justify-center lg:flex">
            <div className="relative w-full max-w-xs">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search movies..."
                aria-label="Search movies"
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Desktop Authentication */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <span
                  className="max-w-32 truncate text-sm font-semibold text-gray-700"
                  title={user?.name}
                >
                  Hi, {user?.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="whitespace-nowrap font-semibold text-gray-700 transition hover:text-blue-600"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="space-y-4 border-t border-gray-100 py-4 md:hidden">
            {/* Mobile Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search movies..."
                aria-label="Search movies"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col gap-4">
              <Link to="/" onClick={closeMenu} className={navLinkClass("/")}>
                Home
              </Link>

              {/* Mobile Categories */}
              <div>
                <button
                  type="button"
                  onClick={() => setCategoryOpen((open) => !open)}
                  aria-expanded={categoryOpen}
                  className="flex w-full items-center justify-between font-medium text-gray-700"
                >
                  Categories
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      categoryOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 7.22a.75.75 0 011.06 0L10 10.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {categoryOpen && (
                  <div className="mt-2 space-y-1 rounded-lg bg-gray-50 p-2">
                    {categories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleCategoryClick(item)}
                        className={`block w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-blue-50 hover:text-blue-600 ${
                          category === item
                            ? "bg-blue-50 font-semibold text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/watchlist"
                onClick={closeMenu}
                className={navLinkClass("/watchlist")}
              >
                Watchlist
              </Link>
            </div>

            {/* Mobile Authentication */}
            <div className="border-t border-gray-100 pt-4">
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Signed in as {user?.name}
                  </p>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-left font-semibold text-white transition hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-center font-semibold text-white transition hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
