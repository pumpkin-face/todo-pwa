import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Páginas
import App from './App.tsx';
import Login from './page/Login.tsx';
import Dashboard from './page/Dashboard.tsx';
import Register from './page/Register.tsx';

// Componentes de rutas privadas
import PrivateRoutes from './routes/PrivateRoutes.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- Rutas Privadas --- */}
        <Route element={<PrivateRoutes />}>
          {/* Todas las rutas aquí adentro estarán protegidas */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Si tuviera más rutas, irían aquí: */}
          {/* <Route path="/profile" element={<Profile />} /> */}
          {/* <Route path="/settings" element={<Settings />} /> */}
        </Route>
        
        {/* --- Ruta para Páginas no Encontradas (404) --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);