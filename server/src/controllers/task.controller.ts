import { Request, Response } from "express";
import Task, { ITask } from '../models/Task';

// --- Definición de Interfaces ---

// Añado la interfaz personalizada para peticiones autenticadas
interface AuthRequest extends Request {
    userId?: string;
}

interface CreateTaskBody {
    title: string;
    description?: string;
    status?: ITask['status'];
    clientID?: string;
}

interface BulkSyncBody {
    tasks: Array<{
        clientID: string;
        title: string;
        description?: string;
        status?: ITask['status'];
    }>;
}

const allowedStatus = ['Pending', 'In Progress', 'Completed'];

// --- Controladores CRUD ---

// Aplico AuthRequest a TODAS las funciones de este archivo
export async function list(req: AuthRequest, res: Response) {
    try {
        const tasks = await Task.find({ user: req.userId, deleted: false }).sort({ createdAt: -1 });
        return res.json(tasks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error listing tasks" });
    }
}

export async function getOne(req: AuthRequest, res: Response) {
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

export async function create(req: AuthRequest, res: Response) {
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

export async function update(req: AuthRequest, res: Response) {
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

export async function destroy(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const task = await Task.findOneAndUpdate(
            { _id: id, user: req.userId },
            { deleted: true },
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you do not have permission' });
        }

        return res.sendStatus(204);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error deleting task" });
    }
}

export async function bulksync(req: AuthRequest, res: Response) {
    try {
        const { tasks }: BulkSyncBody = req.body;
        const mapping = [];

        for (const item of tasks) {
            if (!item.clientID || !item.title) continue;

            const doc = await Task.findOne({ user: req.userId, clientID: item.clientID });

            if (!doc) {
                const newDoc = await Task.create({
                    user: req.userId,
                    title: item.title,
                    description: item.description,
                    status: item.status && allowedStatus.includes(item.status) ? item.status : 'Pending',
                    clientID: item.clientID
                });
                mapping.push({ clientID: item.clientID, serverID: (newDoc as any)._id.toString() });

            } else {
                doc.title = item.title ?? doc.title;
                doc.description = item.description ?? doc.description;
                if (item.status && allowedStatus.includes(item.status)) {
                    doc.status = item.status;
                }
                await doc.save();
                mapping.push({ clientID: item.clientID, serverID: (doc as any)._id.toString() });
            }
        }
        return res.json({ mapping });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error during bulk sync" });
    }
}