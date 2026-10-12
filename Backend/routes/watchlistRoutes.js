import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { getWatchlist, addMovie, removeMovie } from "../controllers/watchlistController.js";

const router = express.Router();

router.use(protect);

router.get("/", getWatchlist);

router.post("/", addMovie);

router.delete("/:movieId", removeMovie);

export default router;
