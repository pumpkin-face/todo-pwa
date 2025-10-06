import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.get('/', (req: Request, res: Response) => res.json({ ok: true, name: 'todo-pwa-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Conexión a la Base de Datos y Arranque del Servidor
mongoose.connect(process.env.MONGODB_URI!)
    .then(() => {
        console.log("Connection Succesful to MongoDB. Atte David SF");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error('Error connecting to MongoDB:', err));