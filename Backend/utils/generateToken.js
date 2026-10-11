import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    if(!process.env.JWT_SECRET){
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        { sub: userId.toString() },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

export const setTokenCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction? "none": "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });
};

export const clearTokenCookie = (res) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    });
};