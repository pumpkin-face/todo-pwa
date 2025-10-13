import axios from 'axios';

export const api = axios.create({
  // Un baseURL relativo es suficiente y más limpio.
  baseURL: '/api'
});

export function setAuth(token: string | null) {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
}

// Este interceptor es una excelente práctica.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setAuth(null);
            // Redirige al login si el token es inválido o ha expirado.
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Carga el token del usuario al iniciar la aplicación.
setAuth(localStorage.getItem('token'));