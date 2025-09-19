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
        <div className="login-container container">
            <div className="login-box">
                <h1>Login</h1>
                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Entering...' : 'Enter'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </form>
            </div>
        </div>
    );
}