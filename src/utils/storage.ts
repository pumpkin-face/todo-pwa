// customer/src/utils/storage.ts

import type { Task } from '../types'; // <-- IMPORTAMOS EL TIPO

// El tipo SyncAction se queda aquí porque solo se usa en este contexto
type SyncAction = {
    type: 'create' | 'update' | 'delete';
    payload: any;
};

// --- Funciones para Tareas ---
export const getLocalTasks = (): Task[] => {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
};

export const setLocalTasks = (tasks: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

// --- Funciones para la Cola de Sincronización ---
export const getSyncQueue = (): SyncAction[] => {
    const queue = localStorage.getItem('syncQueue');
    return queue ? JSON.parse(queue) : [];
};

export const addToSyncQueue = (action: SyncAction) => {
    const queue = getSyncQueue();
    queue.push(action);
    localStorage.setItem('syncQueue', JSON.stringify(queue));
};

export const clearSyncQueue = () => {
    localStorage.removeItem('syncQueue');
};