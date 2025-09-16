import axios from 'axios';

/**
 * Creamos una instancia de Axios con configuración base.
 * Esta instancia se usará para todas las peticiones a la API.
 */
export const api = axios.create({
    // La URL base de nuestra API. Gracias al proxy de Nginx,
    // solo necesitamos apuntar a '/api'. Nginx se encargará de
    // redirigir la petición al backend en el puerto 5000.
    baseURL: '/api'
});

/**
 * Función para establecer el token de autorización en todas las peticiones futuras.
 * @param token El token JWT recibido del login.
 */
export function setAuth(token: string | null) {
    if (token) {
        // Corregido: Se usan backticks (`) en lugar de comillas simples (')
        // para que la variable ${token} sea interpretada correctamente.
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        // Si no hay token (al hacer logout), se elimina la cabecera.
        delete api.defaults.headers.common['Authorization'];
    }
}