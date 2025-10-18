import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
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

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const task = await Task.findOne({ _id: id, user: userId, deleted: false });
      if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
      return res.json(task);
    } else if (req.method === 'PUT') {
      const task = await Task.findOneAndUpdate(
        { _id: id, user: userId, deleted: false }, 
        req.body, 
        { new: true }
      );
      if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
      return res.json(task);
    } else if (req.method === 'DELETE') {
      const task = await Task.findOneAndUpdate(
        { _id: id, user: userId }, 
        { deleted: true }
      );
      if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
      return res.status(204).send(''); // CORREGIDO: usar status().send()
    } else {
      return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
}