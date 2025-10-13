import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import Task from '../models/Task';
import jwt from 'jsonwebtoken';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

const authenticate = async (req: VercelRequest) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme") as any;
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
    if (req.method === 'GET') {
      const tasks = await Task.find({ user: userId, deleted: false }).sort({ createdAt: -1 });
      return res.json(tasks);
    } else if (req.method === 'POST') {
      const { title, description } = req.body;
      if (!title) return res.status(400).json({ message: 'El título es requerido' });
      
      const task = await Task.create({ user: userId, title, description });
      return res.status(201).json(task);
    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
}