import { Request, Response } from "express";
import Task, { ITask } from '../models/Task';

interface AuthRequest extends Request {
    userId?: string;
}

export async function list(req: AuthRequest, res: Response) {
    try {
        const tasks = await Task.find({ user: req.userId, deleted: false }).sort({ createdAt: -1 });
        return res.json(tasks);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getOne(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const task = await Task.findOne({ _id: id, user: req.userId, deleted: false });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        return res.json(task);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export async function create(req: AuthRequest, res: Response) {
    try {
        const { title, description } = req.body;
        if (!title) { return res.status(400).json({ message: 'Title is required' }); }
        const task: ITask = await Task.create({ user: req.userId, title, description });
        return res.status(201).json(task);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export async function update(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const task = await Task.findOneAndUpdate({ _id: id, user: req.userId, deleted: false }, req.body, { new: true });
        if (!task) { return res.status(404).json({ message: 'Task not found' }); }
        return res.json(task);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export async function destroy(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const task = await Task.findOneAndUpdate({ _id: id, user: req.userId }, { deleted: true });
        if (!task) { return res.status(404).json({ message: 'Task not found' }); }
        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export async function syncTasks(req: AuthRequest, res: Response) {
    try {
        const { actions } = req.body;
        if (!Array.isArray(actions)) { return res.status(400).json({ message: 'Invalid payload' }); }
        
        const idMap: { [key: string]: string } = {};

        for (const action of actions) {
            const { type, payload } = action;
            if (payload._id?.startsWith('client-') && idMap[payload._id]) {
                payload._id = idMap[payload._id];
            }

            switch (type) {
                case 'create':
                    const clientID = payload._id;
                    const newTask: ITask = await Task.create({ ...payload, _id: undefined, user: req.userId });
                    if (clientID) { idMap[clientID] = newTask._id.toString(); }
                    break;
                case 'update':
                    if (!payload._id?.startsWith('client-')) {
                        await Task.findOneAndUpdate({ _id: payload._id, user: req.userId }, { $set: payload });
                    }
                    break;
                case 'delete':
                    if (!payload._id?.startsWith('client-')) {
                        await Task.findOneAndUpdate({ _id: payload._id, user: req.userId }, { deleted: true });
                    }
                    break;
            }
        }
        return res.status(200).json({ message: 'Sync successful', idMap });
    } catch (error) {
        console.error("Sync Error:", error);
        return res.status(500).json({ message: "Server error during sync" });
    }
}