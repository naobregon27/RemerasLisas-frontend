import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// URL del backend (misma fuente que apiConfig / INTEGRACION-FRONTEND-TIENDA)
const API_URL = API_BASE_URL;

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
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
    ];
    const urlPath = (config.url || '').split('?')[0];
    const isPublicStoreRead =
      config.method?.toLowerCase() === 'get' &&
      urlPath.includes('/api/tiendas/') &&
      (urlPath.includes('/configuracion/publica') ||
        /\/api\/tiendas\/[^/]+\/videos$/.test(urlPath) ||
        /^\/api\/tiendas\/[^/]+$/.test(urlPath));
    const isPublicRoute =
      publicRoutes.some((route) => config.url?.includes(route)) || isPublicStoreRead;
    
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
        
        if (token) {
          if (!config.headers) config.headers = {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch {
        // JSON corrupto en localStorage — se ignora silenciosamente
      }
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