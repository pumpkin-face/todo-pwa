import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
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
  await mongoose.connect(process.env.MONGODB_URI!);
};

// --- Autenticación ---
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

// --- Manejador del Endpoint ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // Un mapa para almacenar los IDs temporales y los IDs reales de la BD
    const idMap = new Map<string, string>();

    // Procesar cada acción de la cola EN ORDEN
    for (const action of actions) {
      let { type, payload } = action;
      let { _id, ...dataToUpdate } = payload; // Separa el ID del resto del payload

      // Revisa si el ID es uno temporal que ya hemos mapeado
      if (_id && idMap.has(_id)) {
        _id = idMap.get(_id)!; // ¡Usa el ID real de la BD!
      }

      switch (type) {
        case 'create':
          // El ID en el payload es el ID temporal del cliente (ej. 'client-...')
          const tempClientId = _id; 
          
          // Creamos la tarea, ignorando el ID temporal
          const newTask = await Task.create({ 
            ...dataToUpdate, 
            user: userId ,
            isDeleted: false
          });
          
          // Guardamos el ID real en nuestro mapa
          if (tempClientId) {
            idMap.set(tempClientId, newTask._id.toString());
          }
          break;

        case 'update':
          // El _id ya ha sido reemplazado por el ID real gracias al mapa
          await Task.updateOne(
            { _id: _id, user: userId },
            { $set: dataToUpdate }
          );
          break;

        case 'delete':
          // El _id ya ha sido reemplazado por el ID real
          await Task.updateOne(
            { _id: _id, user: userId },
            { $set: { isDeleted: true } }
          );
          break;
      }
    }

    // --- MODIFICACIÓN CLAVE ---
    // 1. Después de procesar todas las acciones, busca la lista de tareas actualizada
    const allTasks = await Task.find({ 
      user: userId, 
      isDeleted: false 
    }).sort({ createdAt: -1 });

    // 2. Devuelve la lista de tareas junto con el mensaje de éxito
    return res.status(200).json({ 
      message: "Sincronización exitosa",
      tasks: allTasks // <-- Devuelve la lista actualizada
    });

  } catch (error) {
    console.error("Error en /api/tasks/sync:", error);

    let errorMessage = "Error del servidor durante la sincronización";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(500).json({ 
      message: "Error del servidor durante la sincronización", 
      errorDetails: errorMessage
    });
  }
}