import { Link } from "react-router-dom";
import movieLogo from "../assets/image.png";

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={movieLogo}
              alt="Movie Watchlist"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <span className="text-lg font-black tracking-tight text-gray-900 sm:text-xl">
              Movie<span className="text-blue-600">Watchlist</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-7 text-sm font-bold text-gray-600">
            <Link to="/" className="transition hover:text-blue-600">
              Trending
            </Link>
            <Link to="/watchlist" className="transition hover:text-blue-600">
              My Watchlist
            </Link>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-blue-600"
            >
              TMDB Database
            </a>
          </div>

          {/* Legal / Attribution */}
          <p className="text-center text-xs sm:text-sm text-gray-400 sm:text-right font-medium">
            Powered by The Movie Database (TMDB) API.
            <br />
            © {new Date().getFullYear()} Movie Watchlist. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
