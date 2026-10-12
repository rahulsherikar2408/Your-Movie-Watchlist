import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    poster_path: {
        type: String,
        default: null,
    },
    vote_average: {
        type: Number,
        default: 0,
    },
    popularity: {
        type: Number,
        default: 0,
    },
    genre_ids: {
        type: [Number],
        default: [],
    },
    overview: {
        type: String,
        default: "",
    },
    release_date: {
        type: String,
        default: "",
    },
}, { _id: false });

const watchlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        unique: true,
    },
    movies: {
        type: [movieSchema],
        default: [],
    },
}, { timestamps: true })

const Watchlist = mongoose.model("watchlist", watchlistSchema);

export default Watchlist;