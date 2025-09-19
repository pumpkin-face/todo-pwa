import { useEffect, useMemo, useState, type FormEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuth } from '../api';

// Definimos la "forma" de una tarea para que coincida con nuestro backend
type Task = {
    _id: string;
    title: string;
    description: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    createdAt: string;
};

export default function Dashboard() {
    // --- Estados del Componente ---
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'Completed' | 'Pending'>('all');
    
    // Estados para la edición en línea de una tarea
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    
    const navigate = useNavigate();

    // --- Carga Inicial de Datos ---
    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error("Failed to load tasks", error);
        } finally {
            setLoading(false);
        }
    }, []); // useCallback con [] asegura que esta función no se recree en cada render

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuth(token);
            loadTasks();
        } else {
            navigate('/login');
        }
    }, [loadTasks, navigate]);

    // --- Lógica de Filtrado y Búsqueda ---
    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => {
                if (filter === 'all') return true;
                return task.status === filter;
            })
            .filter(task => 
                task.title.toLowerCase().includes(search.toLowerCase())
            );
    }, [tasks, search, filter]); // Se recalcula solo si estas dependencias cambian

    // --- Funciones CRUD (Create, Read, Update, Delete) ---

    async function addTask(e: FormEvent) {
        e.preventDefault();
        const title = newTaskTitle.trim();
        if (!title) return;

        try {
            const { data: newTask } = await api.post('/tasks', { title });
            setTasks([newTask, ...tasks]); // Añade la nueva tarea al inicio del array
            setNewTaskTitle('');
        } catch (error) {
            console.error("Failed to add task", error);
        }
    }

    async function toggleTaskStatus(task: Task) {
        const oldTasks = tasks;
        const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
        const updatedTask: Task = { ...task, status: newStatus };

        // Actualización optimista: la UI cambia al instante
        setTasks(prev => prev.map(t => t._id === task._id ? updatedTask : t));

        try {
            await api.put(`/tasks/${task._id}`, { status: newStatus });
        } catch (error) {
            console.error("Failed to toggle task status", error);
            setTasks(oldTasks); // Revertir en caso de error en el backend
        }
    }

    async function deleteTask(id: string) {
        const oldTasks = tasks;
        setTasks(prev => prev.filter(t => t._id !== id)); // Actualización optimista

        try {
            await api.delete(`/tasks/${id}`);
        } catch (error) {
            console.error("Failed to delete task", error);
            setTasks(oldTasks); // Revertir en caso de error
        }
    }

    // --- Funciones de Edición ---

    function startEdit(task: Task) {
        setEditingId(task._id);
        setEditingTitle(task.title);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditingTitle('');
    }

    async function saveEdit(e: FormEvent) {
        e.preventDefault();
        if (!editingId || !editingTitle.trim()) return;

        const oldTasks = tasks;
        const originalTask = tasks.find(t => t._id === editingId);
        if (!originalTask) return;
        
        const updatedTask: Task = { ...originalTask, title: editingTitle.trim() };
        
        setTasks(prev => prev.map(t => t._id === editingId ? updatedTask : t));
        cancelEdit(); // Salir del modo edición inmediatamente

        try {
            await api.put(`/tasks/${editingId}`, { title: editingTitle.trim() });
        } catch (error) {
            console.error("Failed to save task", error);
            setTasks(oldTasks); // Revertir en caso de error
        }
    }
    
    // --- Cierre de Sesión ---
    function handleLogout() {
        localStorage.removeItem('token');
        setAuth(null);
        navigate('/login');
    }

    // --- Renderizado del Componente ---
    if (loading) return <p>Loading tasks...</p>;

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Task Dashboard</h1>
                <button onClick={handleLogout}>Logout</button>
            </header>

            <section>
                <h3>Add New Task</h3>
                <form onSubmit={addTask}>
                    <input 
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        placeholder="What needs to be done?"
                    />
                    <button type="submit">Add Task</button>
                </form>
            </section>

            <section>
                <h3>Filter & Search</h3>
                <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search tasks..."
                />
                <select 
                    value={filter} 
                    onChange={e => setFilter(e.target.value as 'all' | 'Completed' | 'Pending')}
                >
                    <option value="all">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                </select>
            </section>

            <section>
                <h3>My Tasks</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {filteredTasks.map(task => (
                        <li key={task._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {editingId === task._id ? (
                                <form onSubmit={saveEdit} style={{ display: 'flex', gap: '5px' }}>
                                    <input 
                                        value={editingTitle}
                                        onChange={e => setEditingTitle(e.target.value)}
                                        autoFocus
                                    />
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={cancelEdit}>Cancel</button>
                                </form>
                            ) : (
                                <>
                                    <input 
                                        type="checkbox"
                                        checked={task.status === 'Completed'}
                                        onChange={() => toggleTaskStatus(task)}
                                    />
                                    <span style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
                                        {task.title}
                                    </span>
                                    <button onClick={() => startEdit(task)}>Edit</button>
                                    <button onClick={() => deleteTask(task._id)}>Delete</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}