import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import movieLogo from "../assets/image.png";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Navbar = ({
  contentType = "movie",
  onContentTypeChange,
  category,
  setCategory,
  searchQuery,
  setSearchQuery,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const movieCategories = [
    { label: "Trending Movies", icon: "fa-bolt" },
    { label: "Popular Movies", icon: "fa-fire" },
    { label: "Top Rated Movies", icon: "fa-award" },
  ];
  const tvCategories = [
    { label: "Trending TV Shows", icon: "fa-bolt" },
    { label: "Popular TV Shows", icon: "fa-fire" },
    { label: "Top Rated TV Shows", icon: "fa-award" },
  ];
  const categories = contentType === "tv" ? tvCategories : movieCategories;

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContentTypeToggle = (type) => {
    if (contentType === type) return;
    onContentTypeChange?.(type);
    if (location.pathname.startsWith("/movieinfo")) {
      navigate("/");
    }
  };

  const handleCategoryClick = (selectedCategory) => {
    setCategory(selectedCategory);
    setCategoryOpen(false);
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.info("You have been logged out successfully.");
      setMenuOpen(false);
      navigate("/", { replace: true });
    } catch {
      toast.error("Unable to log out. Please try again.");
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setCategoryOpen(false);
  };

  const navLinkClass = (path) =>
    `relative py-2 text-base font-bold transition-colors duration-200 ${
      location.pathname === path
        ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full"
        : "text-gray-700 hover:text-blue-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-18 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-2.5 transition-transform hover:scale-102"
          >
            <img
              src={movieLogo}
              alt="Movie Watchlist"
              className="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
            />

            <span className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
              Movie<span className="text-blue-600">Watchlist</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className={navLinkClass("/")}>
              Home
            </Link>

            {/* Category Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCategoryOpen((open) => !open)}
                aria-expanded={categoryOpen}
                className="flex items-center gap-1.5 text-base font-bold text-gray-700 transition hover:text-blue-600 cursor-pointer"
              >
                <span>{category === "Category" ? "Categories" : category}</span>
                <i
                  className={`fa-solid fa-chevron-down text-xs transition-transform duration-200 ${
                    categoryOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {categoryOpen && (
                <div className="absolute left-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5">
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Browse Categories
                  </div>
                  {categories.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleCategoryClick(item.label)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition ${
                        category === item.label
                          ? "bg-blue-50 text-blue-600 font-bold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                    >
                      <i className={`fa-solid ${item.icon} text-sm text-gray-400`} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/watchlist" className={navLinkClass("/watchlist")}>
              Watchlist
            </Link>
          </div>

          {/* Desktop Content Type Toggle ("Movies" vs "TV Shows") */}
          <div className="hidden items-center md:flex">
            <div
              role="group"
              aria-label="Content type selector"
              className="inline-flex items-center rounded-full bg-gray-100 p-1 border border-gray-200/80 shadow-inner"
            >
              <button
                type="button"
                onClick={() => handleContentTypeToggle("movie")}
                aria-pressed={contentType === "movie"}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
                  contentType === "movie"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="fa-solid fa-film text-sm" />
                <span>Movies</span>
              </button>

              <button
                type="button"
                onClick={() => handleContentTypeToggle("tv")}
                aria-pressed={contentType === "tv"}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
                  contentType === "tv"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <i className="fa-solid fa-tv text-sm" />
                <span>TV Shows</span>
              </button>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden flex-1 justify-center lg:flex max-w-xs">
            <div className="relative w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={
                  contentType === "tv" ? "Search TV series..." : "Search movies..."
                }
                aria-label={
                  contentType === "tv" ? "Search TV series" : "Search movies"
                }
                className="w-full rounded-full border border-gray-200 bg-gray-50/70 py-2.5 pl-10 pr-8 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-gray-50/80 p-1.5 pr-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-xs">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="max-w-32 truncate text-sm font-bold text-gray-800"
                    title={user?.name}
                  >
                    {user?.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Log out"
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2 text-sm font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-sm" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4.5 py-2 text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-xl p-2.5 text-gray-700 transition hover:bg-gray-100 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <i className="fa-solid fa-xmark text-xl" />
            ) : (
              <i className="fa-solid fa-bars text-xl" />
            )}
          </button>
        </div>

        {/* Mobile Slide-down Drawer */}
        {menuOpen && (
          <div className="space-y-4 border-t border-gray-100 py-4 md:hidden">
            {/* Mobile Content Type Toggle */}
            <div className="flex justify-center">
              <div
                role="group"
                aria-label="Content type selector"
                className="inline-flex w-full items-center justify-center rounded-full bg-gray-100 p-1 border border-gray-200 shadow-inner"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleContentTypeToggle("movie");
                    closeMenu();
                  }}
                  aria-pressed={contentType === "movie"}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition-all ${
                    contentType === "movie"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <i className="fa-solid fa-film text-sm" />
                  <span>Movies</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleContentTypeToggle("tv");
                    closeMenu();
                  }}
                  aria-pressed={contentType === "tv"}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition-all ${
                    contentType === "tv"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <i className="fa-solid fa-tv text-sm" />
                  <span>TV Shows</span>
                </button>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={
                  contentType === "tv" ? "Search TV series..." : "Search movies..."
                }
                aria-label={
                  contentType === "tv" ? "Search TV series" : "Search movies"
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-8 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={closeMenu}
                className="rounded-xl px-3.5 py-2.5 text-base font-bold text-gray-700 hover:bg-gray-50"
              >
                Home
              </Link>

              {/* Mobile Categories */}
              <div>
                <button
                  type="button"
                  onClick={() => setCategoryOpen((open) => !open)}
                  aria-expanded={categoryOpen}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-base font-bold text-gray-700 hover:bg-gray-50"
                >
                  <span>Categories</span>
                  <i
                    className={`fa-solid fa-chevron-down text-sm transition-transform ${
                      categoryOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {categoryOpen && (
                  <div className="mt-1 space-y-1 rounded-xl bg-gray-50 p-2">
                    {categories.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleCategoryClick(item.label)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold ${
                          category === item.label
                            ? "bg-blue-100 text-blue-700 font-bold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <i className={`fa-solid ${item.icon} text-sm text-gray-400`} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/watchlist"
                onClick={closeMenu}
                className="rounded-xl px-3.5 py-2.5 text-base font-bold text-gray-700 hover:bg-gray-50"
              >
                Watchlist
              </Link>
            </div>

            {/* Mobile Auth */}
            <div className="border-t border-gray-100 pt-3">
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {(user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-red-50 py-3 text-center text-sm font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-xl border border-gray-200 py-3 text-center text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="rounded-xl bg-blue-600 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-700"
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
