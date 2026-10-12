import 'dotenv/config'

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from "./routes/authRoutes.js";

import dns from 'node:dns';
if (process.env.MONGODB_URL && process.env.MONGODB_URL.startsWith('mongodb+srv://')) {
    try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {
        console.warn("Failed to set custom DNS servers:", e.message);
    }
}

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
    cors({
        origin: (origin, callback) => {
            if (
                !origin ||
                origin === clientUrl ||
                /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
            ) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        credentials: true,
    })
);

// Routes
// Health check
app.use('/api/health', healthRoutes);

// Authentication APIs
app.use('/api/auth', authRoutes);

app.use('/api', (req, res) => {
    return res.status(404).json({
        success: false,
        message: "API route not found",
    });
});

// Global Error Handling
app.use((err, req, res, next) => {
    console.log(err.stack || err.message);
    return res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === "production"
            ? "Internal server error."
            : err.message || "Something went wrong.",
    });
});

const startServer = async () => {
    try {
        // MongoDB Connection
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running at ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Auth: http://localhost:${PORT}/api/auth`);
        });
    } catch (error) {
        console.error("Server startup failed because MongoDB is unavailable.");
        process.exit(1);
    }
}

startServer();
