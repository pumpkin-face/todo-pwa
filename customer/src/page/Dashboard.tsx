import { useEffect, useMemo, useState, type FormEvent, useCallback, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuth } from '../api';
import './Dashboard.css';

type Task = {
    _id: string;
    title: string;
    status: 'Pending' | 'Completed';
};

type FilterStatus = 'all' | 'Completed' | 'Pending';

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTasks = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
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
            .filter(task => task.title.toLowerCase().includes(search.toLowerCase()));
    }, [tasks, search, filter]);

    function handleFilterChange(e: ChangeEvent<HTMLSelectElement>) {
        setFilter(e.target.value as FilterStatus);
    }
    
    async function addTask(e: FormEvent) {
        e.preventDefault();
        const title = newTaskTitle.trim();
        if (!title) return;

        const optimisticTask: Task = { _id: `temp-${Date.now()}`, title, status: 'Pending' };
        setTasks(prev => [optimisticTask, ...prev]);
        setNewTaskTitle('');

        try {
            await api.post('/tasks', { title });
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

    // --- FUNCIÓN CORREGIDA ---
    async function saveEdit(e: FormEvent) {
        e.preventDefault();

        // Type Guard: nos aseguramos de que editingTask no sea null
        if (!editingTask) return;

        // Ahora podemos usar editingTask.title de forma segura
        if (!editingTask.title.trim()) {
            setEditingTask(null);
            return;
        }

        const originalTasks = tasks;
        const taskToUpdate = editingTask;
        
        setTasks(prev => prev.map(t => t._id === taskToUpdate._id ? taskToUpdate : t));
        setEditingTask(null);

        try {
            await api.put(`/tasks/${taskToUpdate._id}`, { title: taskToUpdate.title.trim() });
        } catch (error)
        {
            console.error("Failed to save task", error);
            setTasks(originalTasks);
        }
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
                <button onClick={handleLogout} className="btn btn-secondary">Cerrar Sesión</button>
            </header>

            <form onSubmit={addTask} className="task-controls">
                <input
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="¿Qué necesitas hacer?"
                    disabled={loading}
                />
                <button type="submit" className="btn btn-primary">Añadir Tarea</button>
            </form>

            <div className="task-controls">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar tareas..."
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
                                <form onSubmit={saveEdit} className="task-form-edit">
                                    <input
                                        value={editingTask.title}
                                        onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                                        className="task-input-edit"
                                        autoFocus
                                        onBlur={() => setEditingTask(null)}
                                    />
                                    <button type="submit" className="btn btn-primary">Guardar</button>
                                    <button type="button" onClick={() => setEditingTask(null)} className="btn btn-secondary">Cancelar</button>
                                </form>
                            ) : (
                                <>
                                    <div className="task-content">
                                        <input
                                            type="checkbox"
                                            checked={task.status === 'Completed'}
                                            onChange={() => toggleTaskStatus(task)}
                                        />
                                        <h2 className="task-title">{task.title}</h2>
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