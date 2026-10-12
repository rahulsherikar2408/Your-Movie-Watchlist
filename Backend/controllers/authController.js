import User from "../models/user.js";
import { generateToken } from "../utils/generateToken.js";

// POST /api/auth/register
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required.",
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedName.length < 2 || normalizedName.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Name must contain between 2 and 50 characters.",
            });
        }

        if (
            normalizedEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must contain between 8 and 72 characters.",
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password,
        });

        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }
        next(error);
    }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password");

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/auth/me
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "User account no longer exists.",
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/logout
export const logout = (req, res) => {

    return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });
};