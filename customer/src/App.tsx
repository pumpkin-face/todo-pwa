import { Link } from 'react-router-dom';
import './App.css'; // Importamos nuestros nuevos estilos

function App() {
  return (
    <div className="landing-page container">
      <header className="navbar">
        <div className="logo">Todo-PWA</div>
        <nav>
          <Link to="/login" className="btn btn-secondary">
            Iniciar Sesión
          </Link>
        </nav>
      </header>

      <main className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Organiza tu vida, una tarea a la vez.</h1>
          <p className="hero-subtitle">
            Todo-PWA es tu asistente personal para gestionar tareas de forma simple, 
            rápida y accesible desde cualquier dispositivo.
          </p>
          <Link to="/login" className="btn btn-primary">
            Comenzar Ahora
          </Link>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Todo-PWA. Creado por David SF.</p>
      </footer>
    </div>
  );
}

export default App;