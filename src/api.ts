import axios from 'axios';

export const api = axios.create({
  // URL para producción en Vercel
  baseURL: typeof window !== 'undefined' 
    ? `${window.location.origin}/api`
    : '/api'
});

export function setAuth(token: string | null) {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setAuth(null);
            window.location.href = '/login';
        }
        throw error;
    }
);

setAuth(localStorage.getItem('token'));