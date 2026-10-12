import mongoose from "mongoose";

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB Connected to Server");
    } catch (error) {
        console.error("MongoDB Error:", error);
        throw error;
    }
};

export default connectDB;