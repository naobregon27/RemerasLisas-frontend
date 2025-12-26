import axios from 'axios';

// URL del backend deployado
const API_URL = import.meta.env.VITE_API_URL || 'https://remeraslisas-backend.onrender.com';

// Crear una instancia de axios con la URL base
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // Importante para CORS
});

// Agregar un interceptor para las solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    // Obtener el token del almacenamiento local
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Extraer el token de diferentes posibles estructuras
        let token = null;
        
        if (user?.token) {
          token = user.token;
        } else if (user?.data?.token) {
          token = user.data.token;
        }
        
        // Si hay un token, agregarlo a los headers
        if (token) {
          if (!config.headers) {
            config.headers = {};
          }
          config.headers['Authorization'] = `Bearer ${token}`;
          
          // Solo log para debug específico
          if (!isPublicRoute) {
            console.log('📤', config.method?.toUpperCase(), config.url, '- Token enviado');
          }
        } else if (!isPublicRoute) {
          console.error('❌ No se encontró token para:', config.url);
        }
      } catch (error) {
        console.error('❌ Error al parsear usuario:', error);
      }
    } else if (!isPublicRoute) {
      console.error('❌ No hay usuario en localStorage para:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor:', error);
    return Promise.reject(error);
  }
);

// Agregar un interceptor para las respuestas
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Si recibimos un error 401, cerrar sesión
      if (error.response.status === 401) {
        console.warn('Sesión expirada');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response.status !== 404) {
        // Solo mostrar errores que no sean 404
        console.error('Error:', error.response.status, error.response.data?.message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Exportar la URL de la API para uso en otros módulos
export { API_URL };

export default axiosInstance; 