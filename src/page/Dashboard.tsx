import { useEffect, useMemo, useState, type FormEvent, useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuth } from '../api';
import './Dashboard.css';
import { getLocalTasks, setLocalTasks, getSyncQueue, addToSyncQueue, clearSyncQueue } from '../utils/storage';
import type { Task, FilterStatus } from '../types';

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>(() => getLocalTasks());
    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();

    // 1. Sincronización optimizada: Usa la respuesta del POST para evitar condiciones de carrera
    const syncWithServer = useCallback(async () => {
        if (!navigator.onLine) {
            console.log("Offline, no se puede sincronizar.");
            return;
        }
        const queue = getSyncQueue();
        if (queue.length === 0) {
            return;
        }

        try {
            // Enviamos la cola y recibimos la lista actualizada en la misma respuesta
            const { data } = await api.post('/tasks/sync', { actions: queue });
            
            clearSyncQueue();
            console.log("Sincronización exitosa.");
            
            // Actualizamos el estado con la lista definitiva del servidor
            setLocalTasks(data.tasks);
            setTasks(data.tasks);

        } catch (error) { 
            console.error("Fallo la sincronización con el servidor:", error); 
        }
    }, []);
    
    // 2. Carga inicial y listeners de red
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setAuth(token);

        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Obtenemos las tareas frescas del servidor
                const { data: serverTasks } = await api.get('/tasks');
                setTasks(serverTasks);
                setLocalTasks(serverTasks);
                // Sincronizamos acciones pendientes si las hay
                await syncWithServer(); 
            } catch (error) {
                console.error("Error al cargar datos iniciales. Usando datos locales.", error);
                setTasks(getLocalTasks());
            } finally {
                setLoading(false);
            }
        };
        
        loadInitialData();
        
        const handleOnline = () => { setIsOnline(true); syncWithServer(); };
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [navigate, syncWithServer]);

    // 3. Filtrado de tareas
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => !task.isDeleted)
                    .filter(task => filter === 'all' || task.status === filter)
                    .filter(task => 
                        task.title.toLowerCase().includes(search.toLowerCase()) || 
                        (task.description && task.description.toLowerCase().includes(search.toLowerCase()))
                    );
    }, [tasks, search, filter]);
    
    function handleFilterChange(e: ChangeEvent<HTMLSelectElement>) { setFilter(e.target.value as FilterStatus); }

    // 4. Crear tarea
    async function addTask(e: FormEvent) {
        e.preventDefault();
        const { title, description } = newTask;
        if (!title.trim()) return;
        
        const newTaskObject: Task = { 
            _id: `client-${crypto.randomUUID()}`, 
            title: title.trim(), 
            description: description.trim(), 
            status: 'Pending', 
            isDeleted: false 
        };

        const newTasks = [newTaskObject, ...tasks];
        setTasks(newTasks);
        setLocalTasks(newTasks);
        addToSyncQueue({ type: 'create', payload: newTaskObject });
        
        setNewTask({ title: '', description: '' });
        syncWithServer();
    }

    // 5. Cambiar estado (Completada/Pendiente) con corrección de tipos
    async function toggleTaskStatus(task: Task) {
        // Corrección de TypeScript: Casteo explícito del tipo
        const newStatus = (task.status === 'Pending' ? 'Completed' : 'Pending') as 'Pending' | 'Completed';
        
        const updatedTask = { ...task, status: newStatus };
        const newTasks = tasks.map(t => t._id === task._id ? updatedTask : t);
        
        setTasks(newTasks);
        setLocalTasks(newTasks);
        addToSyncQueue({ type: 'update', payload: { _id: task._id, status: newStatus } });
        syncWithServer();
    }
    
    // 6. Guardar edición con corrección de tipos
    async function saveEdit(e: FormEvent) {
        e.preventDefault();
        if (!editingTask) return;
        if (!editingTask.title.trim()) { setEditingTask(null); return; }

        // Creamos el objeto limpio para actualizar
        const taskToUpdate = { 
            ...editingTask, 
            title: editingTask.title.trim(), 
            description: editingTask.description ? editingTask.description.trim() : '' 
        };

        const newTasks = tasks.map(t => t._id === taskToUpdate._id ? taskToUpdate : t);
        setTasks(newTasks);
        setLocalTasks(newTasks);
        
        addToSyncQueue({ 
            type: 'update', 
            payload: { 
                _id: taskToUpdate._id, 
                title: taskToUpdate.title, 
                description: taskToUpdate.description 
            } 
        });
        
        setEditingTask(null);
        syncWithServer();
    }

    // 7. Eliminar tarea (UI optimista)
    async function deleteTask(id: string) {
        const newTasks = tasks.map(t => t._id === id ? { ...t, isDeleted: true } : t);
        setTasks(newTasks);
        setLocalTasks(newTasks);
        addToSyncQueue({ type: 'delete', payload: { _id: id } });
        syncWithServer();
    }
    
    function handleLogout() {
        localStorage.removeItem('token');
        setAuth(null);
        navigate('/login');
    }

    return (
        <div className="dashboard-container container">
            <header className="dashboard-header">
                <h1>Mis Tareas</h1>
                {/* Clase CSS actualizada para el diseño responsive */}
                <div className="header-controls">
                    <span style={{ color: isOnline ? 'lightgreen' : 'tomato', fontWeight: 'bold' }}>
                        ● {isOnline ? 'En línea' : 'Sin conexión'}
                    </span>
                    <button onClick={handleLogout} className="btn btn-secondary">Cerrar Sesión</button>
                </div>
            </header>
            
            <form onSubmit={addTask} className="add-task-form">
                <input 
                    value={newTask.title} 
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })} 
                    placeholder="Título de la nueva tarea" 
                />
                <input 
                    value={newTask.description} 
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })} 
                    placeholder="Descripción (opcional)" 
                />
                <button type="submit" className="btn btn-primary">Añadir Tarea</button>
            </form>

            <div className="task-controls">
                <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Buscar en título o descripción..." 
                />
                <select value={filter} onChange={handleFilterChange}>
                    <option value="all">Todas</option>
                    <option value="Pending">Pendientes</option>
                    <option value="Completed">Completadas</option>
                </select>
            </div>
            
            {loading ? <p style={{textAlign: 'center', color: '#777'}}>Cargando tareas...</p> : (
                <div className="task-list">
                    {filteredTasks.length > 0 ? filteredTasks.map(task => (
                        <div key={task._id} className={`task-item ${task.status === 'Completed' ? 'completed' : ''} ${task._id.startsWith('client-') ? 'unsynced' : ''}`}>
                            {editingTask?._id === task._id ? (
                                <form onSubmit={saveEdit} className="task-form-edit">
                                    <input 
                                        value={editingTask.title} 
                                        onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} 
                                        className="task-input-edit" 
                                        autoFocus 
                                    />
                                    <textarea 
                                        value={editingTask.description || ''} 
                                        onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} 
                                        className="task-input-edit" 
                                        placeholder="Descripción" 
                                        rows={3}
                                    />
                                    <div className="task-actions" style={{justifyContent: 'flex-end'}}>
                                        <button type="submit" className="btn btn-primary">Guardar</button>
                                        <button type="button" onClick={() => setEditingTask(null)} className="btn btn-secondary">Cancelar</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="task-content">
                                        <input 
                                            type="checkbox" 
                                            checked={task.status === 'Completed'} 
                                            onChange={() => toggleTaskStatus(task)} 
                                        />
                                        <div className="task-text-group">
                                            <h2 className="task-title">{task.title}</h2>
                                            {task.description && <p className="task-description">{task.description}</p>}
                                        </div>
                                    </div>
                                    <div className="task-actions">
                                        <button onClick={() => setEditingTask(task)} className="btn btn-secondary">Editar</button>
                                        <button onClick={() => deleteTask(task._id)} className="btn btn-primary">Eliminar</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )) : (
                        <div className="no-tasks">
                            <p>¡Felicidades! No tienes tareas pendientes.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}