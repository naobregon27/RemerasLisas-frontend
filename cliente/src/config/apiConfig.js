// Configuración de la API

// URL base del servidor API
const API_BASE_URL = 'https://remeraslisas-backend.onrender.com';

// Rutas para acceder a recursos estáticos/archivos
// La ruta para acceder a archivos debe incluir /api
const UPLOADS_BASE_URL = `${API_BASE_URL}/api`;

// URLs específicas para diferentes tipos de recursos
const IMAGES_URL = `${API_BASE_URL}/api/images`;

// Función para verificar si una cadena es una URL válida
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Función para sanear URLs (eliminar caracteres problemáticos en URLs)
const sanitizeUrlForRequest = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // Reemplazar caracteres especiales en la URL
  // Los corchetes son los más problemáticos
  return url.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
};

// Función para construir URL completas para imágenes
export const buildImageUrl = (path, forceRefresh = false) => {
  // Si no hay path, devolver null
  if (!path) return null;
  
  // Si el path no es string ni objeto, es un error
  if (typeof path !== 'string' && typeof path !== 'object') {
    console.error('buildImageUrl: Tipo de dato no válido para path:', typeof path);
    return null;
  }
  
  // Si es un objeto con propiedad url, extraer la url
  if (typeof path === 'object' && path !== null) {
    // Si tiene propiedad url, usar esa
    if (path.url) {
      return buildImageUrl(path.url, forceRefresh);
    }
    // Si tiene propiedad URI, usarla (compatible con react-native Image)
    else if (path.uri) {
      return buildImageUrl(path.uri, forceRefresh);
    }
    return null;
  }
  
  // Si ya es una URL completa con http/https o data:, devolverla tal cual
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    // Si se solicita forzar refresco, añadir timestamp para evitar caché
    if (forceRefresh && !path.startsWith('data:')) {
      const timestamp = Date.now();
      const separator = path.includes('?') ? '&' : '?';
      return `${path}${separator}t=${timestamp}`;
    }
    return path;
  }
  
  // Si es una ruta relativa, construir la URL completa
  const API_BASE_URL = 'https://e-commerce-backend-flmk.onrender.com';
  
  let url = path;
  
  // Si empieza con /, asegurarse de que sea una ruta relativa correcta
  if (url.startsWith('/')) {
    // Si empieza con /api/, está bien
    if (!url.startsWith('/api/')) {
      // Asegurarse de que comience con /api/
      url = `/api${url}`;
    }
  } else {
    // Si no empieza con /, asegurarse de que tenga /api/
    if (!url.startsWith('api/')) {
      url = `/api/${url}`;
    } else {
      url = `/${url}`;
    }
  }
  
  // Construir URL completa
  let fullUrl = `${API_BASE_URL}${url}`;
  
  // Añadir timestamp para forzar refresco
  if (forceRefresh) {
    const timestamp = Date.now();
    const separator = fullUrl.includes('?') ? '&' : '?';
    fullUrl = `${fullUrl}${separator}t=${timestamp}`;
  }
  
  return fullUrl;
};

// Función para verificar si una cadena es base64 (ya sea con prefijo data:image o sin él)
export const isBase64 = (str) => {
  // Si no es una cadena o está vacía, no es base64
  if (typeof str !== 'string' || !str || str.trim() === '') {
    return false;
  }
  
  // Si comienza con data:image, asumimos que es base64
  if (str.startsWith('data:image')) {
    return true;
  }
  
  // Verificar si es un base64 sin prefijo (solo caracteres base64 válidos y longitud suficiente)
  if (str.length > 100 && /^[A-Za-z0-9+/=]+$/.test(str.substring(0, 100))) {
    return true;
  }
  
  return false;
};

// Función para formatear correctamente una cadena base64 (asegurando que tenga el prefijo correcto)
export const formatBase64 = (str) => {
  // Si no es una cadena, no se puede formatear
  if (typeof str !== 'string') {
    console.warn('formatBase64: valor no es una cadena', typeof str);
    return '';
  }
  
  // Si ya tiene formato data:image, verificar si es completo y correcto
  if (str.startsWith('data:image')) {
    // Si tiene el formato correcto data:image/tipo;base64,CONTENIDO, dejarlo como está
    if (str.includes(';base64,')) {
      return str;
    }
    
    // Si tiene formato incompleto, intentar extraer el contenido base64
    const parts = str.split(',');
    if (parts.length >= 2) {
      return `data:image/jpeg;base64,${parts[1]}`;
    }
    
    // Si no se puede extraer, dejar como está
    return str;
  }
  
  // Si parece ser base64 sin prefijo, añadir el prefijo correcto
  if (/^[A-Za-z0-9+/=]+$/.test(str.substring(0, 100))) {
    return `data:image/jpeg;base64,${str}`;
  }
  
  // Si no reconocemos el formato, devolver tal cual
  return str;
};

export default {
  API_BASE_URL,
  UPLOADS_BASE_URL,
  IMAGES_URL,
  buildImageUrl,
  isValidUrl,
  isBase64,
  formatBase64
}; 