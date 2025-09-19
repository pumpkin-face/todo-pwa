import axios from 'axios';

/**
 * Creamos una instancia de Axios con configuración base.
 * Usar una instancia centralizada nos permite configurar interceptores
 * y cabeceras en un solo lugar.
 */
export const api = axios.create({
    // La URL base de nuestra API. Gracias al proxy de Nginx,
    // solo necesitamos apuntar a '/api'. Nginx se encargará de
    // redirigir la petición al backend en el puerto 5000.
    baseURL: '/api'
});

/**
 * Función para establecer o eliminar el token de autorización en la cabecera
 * de todas las peticiones hechas con nuestra instancia de 'api'.
 * @param token El token JWT o null.
 */
export function setAuth(token: string | null) {
    if (token) {
        // Si recibimos un token, lo añadimos a la cabecera 'Authorization'.
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        // Si recibimos null (al hacer logout), eliminamos la cabecera.
        delete api.defaults.headers.common['Authorization'];
    }
}

// --- INTERCEPTOR DE RESPUESTAS (La parte que añadiste) ---
// Piensa en esto como un "guardia de seguridad" que revisa TODAS las respuestas
// que vienen del backend ANTES de que lleguen a tu componente.
api.interceptors.response.use(
    // El primer argumento es una función que se ejecuta si la respuesta es exitosa (status 2xx).
    // Simplemente dejamos que la respuesta continúe su camino.
    (response) => response,

    // El segundo argumento se ejecuta si la respuesta tiene un error.
    (error) => {
        // Verificamos si el error tiene una respuesta y si el status es 401 (No Autorizado).
        // Esto usualmente significa que el token es inválido o ha expirado.
        if (error.response?.status === 401) {
            // 1. Limpiamos el token inválido del almacenamiento local.
            localStorage.removeItem('token');
            
            // 2. Quitamos la cabecera de autorización de Axios.
            setAuth(null);

            // 3. Redirigimos al usuario a la página de login.
            // Usamos window.location.href aquí porque estamos fuera del contexto de los
            // componentes de React y no podemos usar el hook useNavigate.
            // Corregido: '/login' en lugar de '/logn'.
            window.location.href = '/login'; 
        }

        // Es MUY IMPORTANTE devolver el error.
        // Esto permite que el bloque .catch() en tus componentes (como en Dashboard.tsx)
        // todavía se ejecute y pueda manejar el error (ej: mostrar un mensaje al usuario).
        throw error;
    }
);


// --- INICIALIZACIÓN AL CARGAR LA APP ---
// Esta línea se ejecuta una sola vez cuando la aplicación carga por primera vez.
// Intenta leer el token del localStorage para que el usuario no tenga que
// volver a iniciar sesión cada vez que refresca la página.
setAuth(localStorage.getItem('token'));