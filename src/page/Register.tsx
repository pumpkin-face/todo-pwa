import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { api, setAuth } from "../api";

export default function Register() {
    const [name, setName] = useState('');
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
            // Apuntamos al endpoint de registro
            const { data } = await api.post('/register', { name, email, password });

            // Después de un registro exitoso, el backend nos da un token.
            // Automáticamente iniciamos sesión y guardamos el token.
            localStorage.setItem('token', data.token);
            setAuth(data.token);
            
            // Redirigo al dashboard daddy
            navigate('/dashboard');

        } catch (err) {
            let message = 'Error inesperado al intentar registrar.';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || 'Error al registrar.';
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
                <h1>Registro</h1>
                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <label htmlFor="name">Nombre:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu Nombre"
                            required
                            disabled={loading}
                        />
                    </div>
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
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </form>
                <div style={{ textAlign: 'center', marginTop: '25px', lineHeight: '1.6' }}>
                    <p style={{ margin: 0 }}>
                        ¿No tienes una cuenta? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Iniciar Sesion</Link>
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