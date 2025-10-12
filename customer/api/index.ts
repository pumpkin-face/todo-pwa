import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";

// Las rutas ahora se importan desde la misma carpeta 'api'
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Morgan es útil para ver logs en Vercel

// Conexión a la Base de Datos
// Es importante manejar la conexión para que no se abra una nueva en cada petición
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log("MongoDB connected for Vercel"))
        .catch((err) => console.error('Error connecting to MongoDB:', err));
}

// Rutas de la API
// Vercel maneja el prefijo /api automáticamente
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Exportamos la app para que Vercel la use
export default app;