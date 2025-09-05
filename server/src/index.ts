import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
// import taskRoutes from "./routes/taskRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Paths
// app.use('/api/tasks', taskRoutes);

mongoose.connect(process.env.MONGODB_URI!)
.then(() => {
    console.log("Connection Succesful to MongoDB");
    app.listen(PORT, () => console.log('Server eunning on port ${PORT}'));
})
.catch((err) => console.error('Error connecting to MongoDB:', err));

