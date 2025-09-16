import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { api, setAuth } from "../api";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', { email, password });

            localStorage.setItem('token', data.token);
            setAuth(data.token);
            navigate('/');

        } catch (err) {
            let message = 'An unexpected error occurred.';

            // Verificamos si es un error de Axios de forma segura
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || 'Error trying to login.';
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Login</h2>
            
            <label htmlFor="email">Email:</label>
            <input 
                id="email"
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="tu@email.com"
                required
                disabled={loading}
            />
            
            <label htmlFor="password">Password:</label>
            <input 
                id="password"
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Password"
                required
                disabled={loading}
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Entering...' : 'Enter'}
            </button>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
}