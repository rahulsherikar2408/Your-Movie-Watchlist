# 🎬 Movie Watchlist — Full Stack Application

A full-stack, responsive web application for discovering trending films and television series, streaming official trailers, managing personalized watchlists, and engaging in community discussions. Built with **React 19**, **Vite**, **Tailwind CSS v4**, **Redux Toolkit**, **Node.js**, **Express**, **MongoDB**, and the **TMDB (The Movie Database) API**.

---

## 🌟 Overview & Key Highlights

- **Seamless Movies & TV Shows Switching:** Switch between Movies and TV series with a persistent toggle in the navigation bar. Content endpoints, genres, and metadata automatically update and retain user preferences.
- **Cinematic Spotlight Banner:** High-definition auto-playing carousel featuring spotlight titles with multi-stop dark gradients and backdrop highlights.
- **Live Search & Category Browsing:** Search across millions of titles with debounced API requests or browse curated categories (Trending, Popular, Top Rated).
- **Page Retention on Navigation:** Synchronized search params (`?page=X`) ensure that clicking into a movie card and returning retains your exact page position.
- **Embedded Trailer Player:** Watch official YouTube trailers and teasers directly inside an interactive modal with a multi-video selector.
- **Dual-View Watchlist:** Manage your saved titles in either a detailed **Table View** or an immersive **Poster Grid View**, complete with genre filter pills, rating sorting, and collection statistics.
- **Community Reviews & Discussions:** Authenticated users can post, edit, and delete comments on any movie or TV series page.
- **Toastr Feedback:** Instant animated toast notifications for login, logout, account creation, watchlist additions, and watchlist removals.
- **Visual Loading Indicators:** Polished loading spinners and pulse skeleton cards for all asynchronous operations.

---

## 🏗️ Tech Stack Architecture

### Frontend
- **Framework & Tooling:** [React 19](https://react.dev/), [Vite 7](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) (Async Thunks for watchlist synchronization)
- **Routing:** [React Router v7](https://reactrouter.com/) (Protected routes, URL query params sync)
- **HTTP Client:** [Axios](https://axios-http.com/) (Configured request interceptors with JWT Bearer token injection)
- **Icons & Media:** [FontAwesome 6](https://fontawesome.com/), [React Alice Carousel](https://github.com/maxmarinich/react-alice-carousel)

### Backend
- **Runtime & Framework:** [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/)
- **Database & ODM:** [MongoDB](https://www.mongodb.com/), [Mongoose 9](https://mongoosejs.com/)
- **Authentication:** JSON Web Tokens (JWT), [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- **Middleware:** CORS, Cookie Parser, Express JSON body parsing, centralized error handling

---

## 📁 Project Structure

```text
Movie Watchlist/
├── Backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile fetching
│   │   ├── commentController.js  # Comment CRUD operations
│   │   └── watchlistController.js# Watchlist management
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification (Cookie & Bearer header)
│   ├── models/
│   │   ├── Comment.js            # Comment MongoDB schema
│   │   ├── User.js               # User MongoDB schema
│   │   └── Watchlist.js          # Watchlist item MongoDB schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── commentRoutes.js      # /api/movies/:id/comments & /api/comments/:id
│   │   ├── healthRoutes.js       # /api/health check
│   │   └── watchlistRoutes.js    # /api/watchlist routes
│   ├── index.js                  # Express server entry point
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── assets/               # Images and brand logos
│   │   ├── components/
│   │   │   ├── Banner.jsx        # Spotlight carousel banner
│   │   │   ├── Footer.jsx        # App footer with TMDB attribution
│   │   │   ├── MovieCard.jsx     # Poster card with ratings, heart toggle, & hover zoom
│   │   │   ├── MovieInfo.jsx     # Title details, trailer modal, & comments section
│   │   │   ├── Movies.jsx        # Responsive catalog grid with skeleton loaders
│   │   │   ├── Navbar.jsx        # Frosted glass nav, content switch, search, & auth
│   │   │   ├── Pagination.jsx    # Rounded pill pagination controls
│   │   │   └── Watchlist.jsx     # Dual-view watchlist (Table & Grid) with stats
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication context & state management
│   │   │   └── ToastContext.jsx  # Toastr notifications provider & hook
│   │   ├── redux/
│   │   │   ├── store.js          # Redux Toolkit store
│   │   │   └── watchlistSlice.js # Async thunks for watchlist CRUD
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx# Guards private routes (e.g. /watchlist)
│   │   ├── services/
│   │   │   └── api.js            # Axios client with request auth interceptor
│   │   ├── utility/
│   │   │   ├── carouselData.js   # Featured spotlight titles
│   │   │   └── genre.js          # TMDB Movie and TV genre mappings
│   │   ├── App.jsx               # App routing and layout root
│   │   ├── index.css             # Tailwind v4 directives & typography
│   │   └── main.jsx              # React root render
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## ⚡ Installation & Setup Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas cluster)
- [TMDB API Key](https://www.themoviedb.org/documentation/api) (free account)

---

### 2. Backend Setup
1. Open a terminal and navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` folder with the following variables:
   ```env
   PORT=8000
   MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/moviewatchlist?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start at `http://localhost:8000`.*

---

### 3. Frontend Setup
1. In another terminal, navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Frontend` folder with your TMDB API key:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will start at `http://localhost:5173`.*

---

## 📡 Backend API Endpoints

### Health Check
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Server uptime & connection status | No |

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT | No |
| `POST` | `/api/auth/logout` | Clear authentication session | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |

### Watchlist (`/api/watchlist`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/watchlist` | Get user's saved watchlist titles | Yes |
| `POST` | `/api/watchlist` | Add a title to user's watchlist | Yes |
| `DELETE` | `/api/watchlist/:movieId` | Remove a title from watchlist | Yes |

### Comments & Reviews (`/api`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/movies/:movieId/comments` | Fetch all reviews for a title | No |
| `POST` | `/api/movies/:movieId/comments` | Post a comment on a title | Yes |
| `PATCH` | `/api/comments/:commentId` | Edit a user's own comment | Yes |
| `DELETE` | `/api/comments/:commentId` | Delete a user's own comment | Yes |

---

## 🎨 UI/UX Features & Design Decisions

1. **Frosted Glass Header:** Modern sticky header (`backdrop-blur-md`) featuring an active page indicator, quick search bar with instant clear button, category selector with outside-click dismissal, and mobile drawer.
2. **Accessible Pagination:** Pill-shaped pagination with chevron indicators and page counts (`Page X of Y`).
3. **Adaptive Card Layout:** Cards feature 2:3 aspect ratio posters, gold star rating badges, release years, and media badges (`Movie` / `TV Series`).
4. **Toast Feedback:** Toastr alerts provide real-time updates for auth events, adding/removing watchlist items, and API errors.
5. **Interactive Trailer Modal:** Video modal handles official YouTube trailers with 16:9 aspect ratio and multi-video selector pills.
6. **Legibility & Sizing:** Standardized 16px base font size with high-contrast text and comfortable line spacing.

---

## 🧪 Verification & Building

To verify and produce a production build of the frontend:

```bash
cd Frontend
npm run lint    # Verifies ESLint rules and syntax (0 errors)
npm run build   # Compiles production assets into dist/
```

