import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import Task from '../models/Task.js'; // Asegúrate de tener .js
import jwt from 'jsonwebtoken';

// --- Interfaz para el payload del JWT ---
interface JwtPayload {
  id: string;
}

// --- Interfaz para una Acción de la Cola ---
interface SyncAction {
  type: 'create' | 'update' | 'delete';
  payload: any;
}

// --- Conexión a la BD ---
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  // Asegúrate de que MONGODB_URI esté en tus variables de entorno de Vercel
  await mongoose.connect(process.env.MONGODB_URI!);
};

// --- Autenticación ---
const authenticate = async (req: VercelRequest): Promise<string | null> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    // Asegúrate de que JWT_SECRET esté en tus variables de entorno de Vercel
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded.id;
  } catch {
    return null;
  }
};

// --- Manejador del Endpoint ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Solo permitir peticiones POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  await connectDB();
  const userId = await authenticate(req);
  if (!userId) {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const { actions } = req.body as { actions: SyncAction[] };
    
    if (!actions || !Array.isArray(actions)) {
        return res.status(400).json({ message: "Formato de acciones inválido." });
    }

    // 2. Procesar cada acción de la cola
    for (const action of actions) {
      const { type, payload } = action;
      // Separa el ID temporal/real del resto del payload
      const { _id, ...dataToUpdate } = payload; 

      switch (type) {
        case 'create':
          // Creamos la tarea, asignándola al usuario correcto
          // Ignoramos el _id temporal del cliente (ej. 'client-uuid')
          await Task.create({ 
            ...dataToUpdate, 
            user: userId 
          });
          break;

        case 'update':
          // Actualizamos solo los campos enviados en el payload
          await Task.updateOne(
            { _id: _id, user: userId }, // Busca por ID Y por usuario (por seguridad)
            { $set: dataToUpdate }
          );
          break;

        case 'delete':
          // Marcamos como eliminada (borrado lógico)
          await Task.updateOne(
            { _id: _id, user: userId },
            { $set: { isDeleted: true } }
          );
          break;
      }
    }

    // 3. Devolver éxito
    return res.status(200).json({ message: "Sincronización exitosa" });

  } catch (error) {
    console.error("Error en /api/tasks/sync:", error);
    return res.status(500).json({ message: "Error del servidor durante la sincronización" });
  }
}