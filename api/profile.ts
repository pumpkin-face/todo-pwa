import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import User from './models/User.js';
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  await connectDB();
  const userId = await authenticate(req);
  
  if (!userId) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const user = await User.findById(userId).select("_id name email");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
}