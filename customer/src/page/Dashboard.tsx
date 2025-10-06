import { useEffect, useMemo, useState, type FormEvent, useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuth } from '../api';
import './Dashboard.css';

// El tipo 'Task' ahora incluye la descripción
type Task = {
    _id: string;
    title: string;
    description: string;
    status: 'Pending' | 'Completed';
};

type FilterStatus = 'all' | 'Completed' | 'Pending';

export default function Dashboard() {
    // --- Estados del Componente ---
    const [tasks, setTasks] = useState<Task[]>([]);
    // Estado unificado para la nueva tarea
    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- Lógica de Datos (sin cambios) ---
    const fetchTasks = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            setAuth(token);
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error("Failed to load tasks", error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => filter === 'all' || task.status === filter)
            .filter(task => 
                task.title.toLowerCase().includes(search.toLowerCase()) ||
                task.description.toLowerCase().includes(search.toLowerCase())
            );
    }, [tasks, search, filter]);

    function handleFilterChange(e: ChangeEvent<HTMLSelectElement>) {
        setFilter(e.target.value as FilterStatus);
    }
    
    // --- Funciones CRUD (actualizadas para incluir descripción) ---
    async function addTask(e: FormEvent) {
        e.preventDefault();
        const { title, description } = newTask;
        if (!title.trim()) return;

        const optimisticTask: Task = { _id: `temp-${Date.now()}`, title: title.trim(), description: description.trim(), status: 'Pending' };
        setTasks(prev => [optimisticTask, ...prev]);
        setNewTask({ title: '', description: '' }); // Limpiamos ambos campos

        try {
            // Enviamos ambos campos al backend
            await api.post('/tasks', { title: title.trim(), description: description.trim() });
            await fetchTasks();
        } catch (error) {
            console.error("Failed to add task", error);
            setTasks(prev => prev.filter(t => t._id !== optimisticTask._id));
        }
    }

    async function toggleTaskStatus(task: Task) {
        const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
        const originalTasks = tasks;
        setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
        try {
            await api.put(`/tasks/${task._id}`, { status: newStatus });
        } catch (error) {
            console.error("Failed to toggle task status", error);
            setTasks(originalTasks);
        }
    }

    async function deleteTask(id: string) {
        const originalTasks = tasks;
        setTasks(prev => prev.filter(t => t._id !== id));
        try {
            await api.delete(`/tasks/${id}`);
        } catch (error) {
            console.error("Failed to delete task", error);
            setTasks(originalTasks);
        }
    }

    async function saveEdit(e: FormEvent) {
        e.preventDefault();
        if (!editingTask) return;
        if (!editingTask.title.trim()) {
            setEditingTask(null);
            return;
        }

        const originalTasks = tasks;
        const taskToUpdate = editingTask;
        
        setTasks(prev => prev.map(t => t._id === taskToUpdate._id ? taskToUpdate : t));
        setEditingTask(null);

        try {
            // Enviamos ambos campos al backend al actualizar
            await api.put(`/tasks/${taskToUpdate._id}`, { 
                title: taskToUpdate.title.trim(),
                description: taskToUpdate.description.trim()
            });
        } catch (error) {
            console.error("Failed to save task", error);
            setTasks(originalTasks);
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        setAuth(null);
        navigate('/login');
    }

    // --- Renderizado del Componente (actualizado) ---
    return (
        <div className="dashboard-container container">
            <header className="dashboard-header">
                <h1>Mis Tareas</h1>
                <button onClick={handleLogout} className="btn btn-secondary">Cerrar Sesión</button>
            </header>

            {/* 5. Formulario de creación con ambos campos */}
            <form onSubmit={addTask} className="task-controls add-task-form">
                <input
                    value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Título de la nueva tarea"
                    disabled={loading}
                />
                <input
                    value={newTask.description}
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Descripción (opcional)"
                    disabled={loading}
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
            
            {loading ? <p>Cargando tareas...</p> : (
                <div className="task-list">
                    {filteredTasks.length > 0 ? filteredTasks.map(task => (
                        <div key={task._id} className={`task-item ${task.status === 'Completed' ? 'completed' : ''}`}>
                            {editingTask?._id === task._id ? (
                                // 6. Formulario de edición con ambos campos
                                <form onSubmit={saveEdit} className="task-form-edit">
                                    <input
                                        value={editingTask.title}
                                        onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                                        className="task-input-edit"
                                        autoFocus
                                    />
                                    <textarea
                                        value={editingTask.description}
                                        onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                                        className="task-input-edit"
                                        placeholder="Descripción"
                                    />
                                    <div className="task-actions">
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
                                        <div>
                                            {/* Mostramos título y descripción */}
                                            <h2 className="task-title">{task.title}</h2>
                                            <p className="task-description">{task.description}</p>
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