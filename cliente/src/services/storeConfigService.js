import axiosWithConfig from './axiosConfig';
import { isBase64, formatBase64 } from '../config/apiConfig';

// Cache para guardar las imágenes base64 entre sesiones
const carruselImagesCache = new Map();

// Inicializar la caché desde localStorage al cargar
try {
  const savedCache = localStorage.getItem('carruselImagesCache');
  if (savedCache) {
    const parsedCache = JSON.parse(savedCache);
    Object.entries(parsedCache).forEach(([key, value]) => {
      carruselImagesCache.set(key, value);
    });
    console.log('Caché de imágenes del carrusel cargada desde localStorage:', Object.keys(parsedCache).length, 'elementos');
  }
} catch (error) {
  console.error('Error cargando caché de imágenes del carrusel:', error);
}

// Función para guardar la caché en localStorage
const saveImageCacheToStorage = () => {
  try {
    const cacheObject = {};
    carruselImagesCache.forEach((value, key) => {
      cacheObject[key] = value;
    });
    localStorage.setItem('carruselImagesCache', JSON.stringify(cacheObject));
    console.log('Caché de imágenes guardada en localStorage:', Object.keys(cacheObject).length, 'elementos');
  } catch (error) {
    console.error('Error guardando caché en localStorage:', error);
  }
};

// Función para procesar URLs de imágenes y convertirlas a formato apropiado para frontend
const processImageUrlForDisplay = (url) => {
  if (!url) return null;
  
  // Si es un objeto con url, extraer la url
  if (typeof url === 'object' && url !== null && url.url) {
    url = url.url;
  }
  
  // Si ya es base64, devolverlo tal cual
  if (typeof url === 'string' && url.startsWith('data:')) {
    return url;
  }
  
  // Ruta base de la API
  const API_BASE_URL = 'https://e-commerce-backend-flmk.onrender.com';
  
  // Si contiene rutas del servidor, convertir a ruta API
  if (typeof url === 'string') {
    const serverPaths = ['/opt/render/project/src/storage', 'C:\\Users\\', '/storage/', 'storage/'];
    
    for (const path of serverPaths) {
      if (url.includes(path)) {
        const storagePos = url.indexOf('storage');
        if (storagePos !== -1) {
          // Extraer la parte relativa y codificar caracteres especiales
          const relativePath = url.substring(storagePos);
          const encodedPath = relativePath.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
          return `${API_BASE_URL}/api/${encodedPath}`;
        }
      }
    }
    
    // Si tiene corchetes pero no está en ninguna de las rutas anteriores
    if (url.includes('[') || url.includes(']')) {
      return url.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
    }
    
    // Si es una URL relativa que empieza con /api/, agregarle la base
    if (url.startsWith('/api/')) {
      return `${API_BASE_URL}${url}`;
    }
  }
  
  return url;
};

// Obtener la configuración de la tienda por slug
export const getStoreConfig = async (slug) => {
  try {
    // Agregar timestamp para evitar caché
    const timestamp = new Date().getTime();
    const response = await axiosWithConfig.get(`/api/tiendas/${slug}/configuracion?t=${timestamp}`);
    
    console.log('📦 Respuesta completa de configuración:', response.data);
    console.log('🖼️ Banner en respuesta:', response.data?.configuracionTienda?.banner);
    console.log('🎠 Carrusel en respuesta:', response.data?.configuracionTienda?.carrusel);
    console.log('🏷️ Logo en respuesta:', response.data?.configuracionTienda?.logo);
    
    // Procesar URLs de banner si existen
    if (response.data?.configuracionTienda?.banner?.length) {
      response.data.configuracionTienda.banner = response.data.configuracionTienda.banner.map(item => {
        if (typeof item === 'object' && item.url) {
          return {
            ...item,
            url: processImageUrlForDisplay(item.url)
          };
        } else if (typeof item === 'string') {
          return processImageUrlForDisplay(item);
        }
        return item;
      });
      console.log('🖼️ Banner procesado:', response.data.configuracionTienda.banner);
    }
    
    // Almacenar en caché las imágenes del carrusel si existen
    if (response.data?.configuracionTienda?.carrusel?.length) {
      let cacheUpdated = false;
      response.data.configuracionTienda.carrusel.forEach(item => {
        if (item.url && item._id) {
          // Procesar URL para guardar en caché
          const processedUrl = processImageUrlForDisplay(item.url);
          carruselImagesCache.set(item._id, processedUrl);
          cacheUpdated = true;
        }
      });
      
      // Si se actualizó la caché, guardarla en localStorage
      if (cacheUpdated) {
        saveImageCacheToStorage();
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error al obtener configuración de tienda:', error);
    throw error;
  }
};

// Actualizar el logo de la tienda
export const updateLogo = async (slug, logoData) => {
  try {
    // Ahora enviamos datos JSON en lugar de FormData
    const response = await axiosWithConfig.put(`/api/tiendas/${slug}/configuracion/logo`, logoData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar logo:', error);
    throw error;
  }
};

// Actualizar el banner de la tienda
export const updateBanner = async (slug, bannerData) => {
  try {
    console.log('Datos recibidos para actualizar banner:', bannerData);
    
    // Crear FormData para enviar las imágenes
    const formData = new FormData();

    // Si tenemos un arreglo de banner en el objeto
    if (bannerData.banner && Array.isArray(bannerData.banner)) {
      console.log('Procesando arreglo de banners, cantidad:', bannerData.banner.length);
      
      // Procesar cada elemento del banner
      bannerData.banner.forEach((item, index) => {
        // Si la URL es base64, convertirla a Blob
        if (item.url && typeof item.url === 'string' && item.url.startsWith('data:')) {
          try {
            // Extraer el tipo MIME y datos base64
            const [mimeInfo, base64Data] = item.url.split(',');
            const mimeType = mimeInfo.match(/:(.*?);/)[1];
            
            console.log(`Procesando imagen ${index + 1}, tipo: ${mimeType}`);
            
            // Convertir base64 a Blob
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: mimeType });
            
            // Agregar el blob al FormData - ACTUALIZADO: cambiado el nombre del campo para coincidir con el backend
            formData.append(`banner`, blob, `banner_${index}.${mimeType.split('/')[1] || 'jpg'}`);
            
            // Agregar el texto alternativo - ACTUALIZADO: nombre simplificado
            formData.append(`bannerAlt`, item.alt || 'Banner de la tienda');
            
            // Si hay un ID existente, enviarlo también - ACTUALIZADO: nombre simplificado
            if (item._id) {
              formData.append(`_id`, item._id);
            }
          } catch (error) {
            console.error(`Error procesando imagen ${index}:`, error);
          }
        } else {
          console.log(`La imagen ${index} no es base64 o no existe`);
        }
      });

      // Imprimir información del FormData para depuración
      console.log('FormData creado para banner, campos:');
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'Blob/File' : pair[1]}`);
      }

      // Enviar el FormData con el Content-Type adecuado
      const response = await axiosWithConfig.put(`/api/tiendas/${slug}/configuracion/banner`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Respuesta del servidor para banner:', response.data);
      console.log('🖼️ Banner guardado:', response.data?.banner || response.data?.configuracion?.banner);
      return response.data;
    } else {
      // Si no es un arreglo, usar el método anterior compatible
      console.log('Usando método de envío tradicional (no es arreglo)');
      const response = await axiosWithConfig.put(`/api/tiendas/${slug}/configuracion/banner`, bannerData);
      return response.data;
    }
  } catch (error) {
    console.error('Error al actualizar banner:', error);
    // Mostrar más detalles del error si están disponibles
    if (error.response) {
      console.error('Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw error;
  }
};

// Función para dividir un carrusel grande en lotes más pequeños
const chunkCarruselData = (carruselData, maxSlides = 2) => {
  if (!carruselData || !carruselData.carrusel || !Array.isArray(carruselData.carrusel)) {
    return null;
  }
  
  // Si el carrusel tiene pocas imágenes, enviarlo completo
  if (carruselData.carrusel.length <= maxSlides) {
    return [carruselData];
  }
  
  // Dividir en lotes
  const chunks = [];
  const items = [...carruselData.carrusel];
  
  while (items.length > 0) {
    const chunk = items.splice(0, maxSlides);
    chunks.push({
      carrusel: chunk
    });
  }
  
  return chunks;
};

// Función auxiliar para convertir base64 a Blob
const base64ToBlob = async (base64String) => {
  // Extraer contenido real del base64
  const base64 = base64String.split(',')[1];
  // Determinar el tipo MIME
  const mimeType = base64String.split(',')[0].split(':')[1].split(';')[0];
  
  const binStr = atob(base64);
  const len = binStr.length;
  const arr = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i);
  }
  
  return new Blob([arr], { type: mimeType });
};

// Actualizar el carrusel de la tienda
export const updateCarrusel = async (slug, data) => {
  try {
    // Si no es FormData, convertir los datos JSON a FormData
    if (!(data instanceof FormData)) {
      const formData = new FormData();
      
      // Si tenemos un arreglo de carrusel en el objeto
      if (data.carrusel && Array.isArray(data.carrusel)) {
        // Procesar cada elemento del carrusel
        data.carrusel.forEach((item, index) => {
          // Si la URL es base64, convertirla a Blob
          if (item.url && typeof item.url === 'string' && item.url.startsWith('data:')) {
            // Extraer el tipo MIME y datos base64
            const [mimeInfo, base64Data] = item.url.split(',');
            const mimeType = mimeInfo.match(/:(.*?);/)[1];
            
            // Convertir base64 a Blob
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: mimeType });
            
            // Agregar el blob al FormData
            formData.append(`imagenes[${index}]`, blob, `imagen_${index}.${mimeType.split('/')[1] || 'jpg'}`);
          }
          
          // Agregar los metadatos de texto
          formData.append(`titulo_${index}`, item.titulo || '');
          formData.append(`subtitulo_${index}`, item.subtitulo || '');
          formData.append(`botonTexto_${index}`, item.botonTexto || '');
          formData.append(`botonUrl_${index}`, item.botonUrl || '');
          formData.append(`orden_${index}`, item.orden || index + 1);
          
          // Si hay un ID existente, enviarlo también
          if (item._id) {
            formData.append(`id_${index}`, item._id);
          }
        });
      }
      
      // Enviar el FormData
      const response = await axiosWithConfig.put(`/api/tiendas/${slug}/configuracion/carrusel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    }
    
    // Si ya es FormData, enviarlo directamente
    const response = await axiosWithConfig.put(`/api/tiendas/${slug}/configuracion/carrusel`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error al actualizar carrusel:", error);
    
    // Mejorar el mensaje de error según el tipo de error
    if (error.response) {
      if (error.response.status === 413) {
        throw new Error('Las imágenes son demasiado grandes. Intente reducir su tamaño o utilizar menos imágenes.');
      } else if (error.response.status === 500) {
        throw new Error('Error en el servidor al procesar las imágenes. Intente con imágenes más pequeñas o en otro formato.');
      }
    }
    
    throw error;
  }
};

// Recuperar imagen de carrusel desde la caché
export const getCarruselImageFromCache = (imageId) => {
  // Primero intentar obtener de la caché en memoria
  let cachedImage = carruselImagesCache.get(imageId);
  
  // Si no está en la caché en memoria, intentar recuperar de localStorage
  if (!cachedImage) {
    try {
      const savedCache = localStorage.getItem('carruselImagesCache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        if (parsedCache[imageId]) {
          cachedImage = parsedCache[imageId];
          // Actualizar la caché en memoria
          carruselImagesCache.set(imageId, cachedImage);
        }
      }
    } catch (error) {
      console.error('Error recuperando imagen desde localStorage:', error);
    }
  }
  
  return cachedImage ? processImageUrlForDisplay(cachedImage) : null;
};

// Agregar sección
export const addSection = async (slug, formData) => {
  try {
    const response = await axiosWithConfig.post(`/api/tiendas/${slug}/configuracion/secciones`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al agregar sección:', error);
    throw error;
  }
};

// Eliminar sección
export const deleteSection = async (slug, sectionId) => {
  try {
    const response = await axiosWithConfig.delete(`/api/tiendas/${slug}/configuracion/secciones/${sectionId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar sección:', error);
    throw error;
  }
};

// Actualizar configuración visual
export const updateVisual = async (slug, visualData) => {
  try {
    const response = await axiosWithConfig.put(`/api/tiendas/${slug}/configuracion/visual`, visualData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar configuración visual:', error);
    throw error;
  }
};

// Función para obtener una imagen por URL con proxy para evitar CORS
export const getImageByProxy = (imageUrl) => axiosWithConfig.get(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`, { 
  responseType: 'blob' 
});

export default {
  getStoreConfig,
  updateLogo,
  updateBanner,
  updateCarrusel,
  addSection,
  deleteSection,
  updateVisual,
  getCarruselImageFromCache,
  getImageByProxy
}; 