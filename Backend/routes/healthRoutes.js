import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  return res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected
      ? "Movie Watchlist API is running and MongoDB is connected."
      : "API is running, but MongoDB is not connected.",
    database: databaseConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

export default router;
