// api/index.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer, IncomingMessage, ServerResponse } from 'http';

// Importar rutas
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

// Cargar variables de entorno
dotenv.config();

// Crear la app de Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Conexión a MongoDB (solo una vez por "cold start")
let mongoConnected = false;
if (process.env.MONGODB_URI && !mongoConnected) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected for Vercel');
      mongoConnected = true;
    })
    .catch((err) => console.error('Error connecting to MongoDB:', err));
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Crear un servidor HTTP
const server = createServer(app);

// Exportar la función serverless de Vercel
export default async (req: VercelRequest, res: VercelResponse) => {
  // Convertir VercelRequest a IncomingMessage
  const mockReq = req as unknown as IncomingMessage;
  const mockRes = res as unknown as ServerResponse;

  // Ejecutar el servidor Express
  return new Promise<void>((resolve) => {
    server.emit('request', mockReq, mockRes);
    res.on('finish', resolve);
    res.on('close', resolve);
  });
};