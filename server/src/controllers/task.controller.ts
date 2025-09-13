import { Request, Response } from "express";
import Task, { ITask } from '../models/Task';

// --- Definición de Interfaces para Tipado Fuerte ---

// Define la forma del cuerpo (body) para crear una tarea
interface CreateTaskBody {
    title: string;
    description?: string;
    status?: ITask['status']; // Usa el tipo del modelo para consistencia
    clientID?: string;
}

// Define la forma del cuerpo (body) para la sincronización masiva
interface BulkSyncBody {
    tasks: Array<{
        clientID: string;
        title: string;
        description?: string;
        status?: ITask['status'];
    }>;
}

// Define los estados permitidos
const allowedStatus = ['Pending', 'In Progress', 'Completed'];

// --- Controladores CRUD ---

/**
 * @description Lista todas las tareas no eliminadas de un usuario
 */
export async function list(req: Request, res: Response) {
    try {
        const tasks = await Task.find({ user: req.userId, deleted: false }).sort({ createdAt: -1 });
        return res.json(tasks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error listing tasks" });
    }
}

/**
 * @description Obtiene una única tarea por su ID
 */
export async function getOne(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const task = await Task.findOne({ _id: id, user: req.userId, deleted: false });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you do not have permission' });
        }
        return res.json(task);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error fetching task" });
    }
}

/**
 * @description Crea una nueva tarea
 */
export async function create(req: Request, res: Response) {
    try {
        const { title, description, status, clientID } = req.body as CreateTaskBody;

        if (!title) {
            return res.status(400).json({ message: 'The title is required' });
        }

        const task = await Task.create({
            user: req.userId,
            title,
            description,
            status: status && allowedStatus.includes(status) ? status : 'Pending',
            clientID
        });
        return res.status(201).json(task);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error creating task" });
    }
}

/**
 * @description Actualiza una tarea existente
 */
export async function update(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        if (status && !allowedStatus.includes(status)) {
            return res.status(400).json({ message: 'Invalid Status' });
        }

        const task = await Task.findOneAndUpdate(
            { _id: id, user: req.userId, deleted: false },
            { title, description, status },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you do not have permission' });
        }
        return res.json(task);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error updating task" });
    }
}

/**
 * @description Elimina una tarea (Borrado Lógico)
 */
export async function destroy(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const task = await Task.findOneAndUpdate(
            { _id: id, user: req.userId },
            { deleted: true },
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you do not have permission' });
        }

        return res.sendStatus(204); // 204: No Content (éxito sin devolver cuerpo)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error deleting task" });
    }
}

/**
 * @description Sincroniza un lote de tareas desde el cliente
 */
export async function bulksync(req: Request, res: Response) {
    try {
        const { tasks }: BulkSyncBody = req.body;
        const mapping = [];

        for (const item of tasks) {
            if (!item.clientID || !item.title) continue;

            const doc = await Task.findOne({ user: req.userId, clientID: item.clientID });

            if (!doc) {
                // --- CREAR ---
                const newDoc = await Task.create({
                    user: req.userId,
                    title: item.title,
                    description: item.description,
                    status: item.status && allowedStatus.includes(item.status) ? item.status : 'Pending',
                    clientID: item.clientID
                });
                // AQUÍ LA CORRECCIÓN FINAL
                mapping.push({ clientID: item.clientID, serverID: (newDoc as any)._id.toString() });

            } else {
                // --- ACTUALIZAR ---
                doc.title = item.title ?? doc.title;
                doc.description = item.description ?? doc.description;
                if (item.status && allowedStatus.includes(item.status)) {
                    doc.status = item.status;
                }
                await doc.save();
                // AQUÍ LA CORRECCIÓN FINAL
                mapping.push({ clientID: item.clientID, serverID: (doc as any)._id.toString() });
            }
        }
        return res.json({ mapping });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error during bulk sync" });
    }
}