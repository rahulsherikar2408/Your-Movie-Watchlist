import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.js";
import { clearTokenCookie } from "../utils/generateToken.js";

export const protect = async (req, res, next) => {
    try {
        // Fetching token through cookie or http header
        const token =
            req.cookies?.token ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
        }

        if (!process.env.JWT_SECRET) {
            return next(new Error("JWT_SECRET is not configured"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (typeof decoded.sub !== "string" || !mongoose.isValidObjectId(decoded.sub)) {
            clearTokenCookie(res);
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }

        const user = await User.findById(decoded.sub);

        if (!user) {
            clearTokenCookie(res);

            return res.status(401).json({
                success: false,
                message: "User account not found.",
            });
        }

        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        };

        next();

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            clearTokenCookie(res);

            return res.status(401).json({
                success: false,
                message: "Your session is invalid or expired. Please log in again.",
            });
        }

        next(error);
    }
}