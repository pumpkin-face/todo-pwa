import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import jwt from 'jsonwebtoken';

interface JwtPayload { id: string; }

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

const authenticate = async (req: VercelRequest): Promise<string | null> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded.id;
  } catch {
    return null;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  const userId = await authenticate(req);
  if (!userId) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    // --- CUANDO SE PIDEN LAS TAREAS (GET) ---
    if (req.method === 'GET') {
      // --- ¡ESTA ES LA CORRECCIÓN! ---
      // Añade { isDeleted: false } para filtrar las tareas eliminadas
      const tasks = await Task.find({ 
        user: userId, 
        isDeleted: false 
      }).sort({ createdAt: -1 });
      
      return res.json(tasks);
    } 
    
    // --- CUANDO SE CREA UNA TAREA (POST) ---
    if (req.method === 'POST') {
      const { title, description } = req.body;
      if (!title) return res.status(400).json({ message: 'El título es requerido' });
      
      const task = await Task.create({ 
        user: userId, 
        title, 
        description, 
        status: 'Pending', 
        isDeleted: false 
      });
      return res.status(201).json(task);
    } 
    
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });

  } catch (error) {
    console.error("Error en /api/tasks/index:", error);
    let errorMessage = "Error del servidor";
    if (error instanceof Error) errorMessage = error.message;
    return res.status(500).json({ message: errorMessage });
  }
}