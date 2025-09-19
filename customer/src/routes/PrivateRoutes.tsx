import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoutes() {
    const token = localStorage.getItem('token');

    // Si hay un token, renderiza el componente de la ruta anidada (<Outlet />)
    // Si no, redirige a /login
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}