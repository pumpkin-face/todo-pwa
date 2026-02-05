import { Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    // Agregamos un ID o clase al wrapper principal para el fondo animado
    <div className="app-wrapper">
      <div className="landing-page container">
        <header className="navbar">
          {/* Añadí un span para poder estilizar el punto final si quieres */}
          <div className="logo">ToDo<span className="logo-accent">.</span>PWA</div>
          <nav>
            <Link to="/login" className="btn btn-secondary">
              Iniciar Sesión
            </Link>
          </nav>
        </header>

        <main className="hero">
          <div className="hero-content">
            <div className="badge">✨ Nueva Versión 2.0</div>
            <h1 className="hero-title">
              Organiza tu vida, <br />
              <span className="highlight">una tarea a la vez.</span>
            </h1>
            <p className="hero-subtitle">
              Todo-PWA es tu asistente personal para gestionar tareas de forma simple,
              rápida y accesible desde cualquier dispositivo.
            </p>
            <div className="cta-group">
                <Link to="/login" className="btn btn-primary">
                Comenzar Ahora
                </Link>
                 {/* Botón extra para balance visual (opcional) */}
                <Link to="/about" className="btn btn-text">
                  Saber más &rarr;
                </Link>
            </div>
          </div>
        </main>

        <footer className="footer">
          <p>&copy; 2025 Todo-PWA. Creado por David SF.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
