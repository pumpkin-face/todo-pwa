import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from 'axios';
import { api, setAuth } from "../api";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/login', { email, password });

            localStorage.setItem('token', data.token);
            setAuth(data.token);
            
            navigate(from, { replace: true });

        } catch (err) {
            let message = 'An unexpected error occurred.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || 'Error trying to login.';
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <div className="login-container">
                <div className="login-box">
                    <h1>Login</h1>
                    <form onSubmit={onSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Correo electronico:</label>
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
                            <label htmlFor="password">Contraseña:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                required
                                disabled={loading}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Entering...' : 'Enter'}
                        </button>
                        {error && <p className="error-message">{error}</p>}
                    </form>
                    <div style={{ textAlign: 'center', marginTop: '25px', lineHeight: '1.6' }}>
                        <p style={{ margin: 0 }}>
                            ¿No tienes una cuenta? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Regístrate</Link>
                        </p>
                        <p style={{ margin: 0 }}>
                            ¿Deseas regresar al inicio? <Link to="/" style={{ color: 'var(--primary-color)' }}>Inicio</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}