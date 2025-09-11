import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
// import taskRoutes from "./routes/task.routes.ts";
// import authRoutes from "./routes/auth.routes.ts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ok: true, name: 'todo-pwa-api'}));
// app.use('/api/tasks',taskRoutes);
// app.use('/api/auth',authRoutes);

// Paths
// app.use('/api/tasks', taskRoutes);

mongoose.connect(process.env.MONGODB_URI!)
.then(() => {
    console.log("Connection Succesful to MongoDB. Atte David SF");
    app.listen(PORT, () => console.log('Server eunning on port ${PORT}'));
})
.catch((err) => console.error('Error connecting to MongoDB:', err));

