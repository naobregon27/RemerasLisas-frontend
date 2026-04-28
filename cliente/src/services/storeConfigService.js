import axiosWithConfig from './axiosConfig';
import { API_BASE_URL, resolveApiMediaUrl } from '../config/apiConfig';

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

  if (typeof url === 'string' && (url.startsWith('/images/') || url.startsWith('/videos/'))) {
    return resolveApiMediaUrl(url);
  }

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
    
    if (url.startsWith('/api/')) {
      return `${API_BASE_URL}${url}`;
    }
    if (url.startsWith('/') && !url.startsWith('//')) {
      return `${API_BASE_URL}${url}`;
    }
  }

  return url;
};

/**
 * Normaliza logo, banners, carrusel, secciones y videos para el front.
 * Data URLs (`data:image/...;base64,...`, `data:video/...;base64,...`) se conservan;
 * rutas legacy `/images/...` y `/videos/...` se resuelven contra el host del API.
 * Mutación in-place de `ct` (misma referencia que `payload.configuracionTienda`).
 */
export const applyMediaToConfiguracionTienda = (ct) => {
  if (!ct || typeof ct !== 'object') return ct;

  if (ct.logo) {
    if (typeof ct.logo === 'object' && ct.logo.url) {
      ct.logo = {
        ...ct.logo,
        url: processImageUrlForDisplay(ct.logo.url),
      };
    } else if (typeof ct.logo === 'string') {
      ct.logo = {
        url: processImageUrlForDisplay(ct.logo),
        alt: 'Logo de la tienda',
      };
    }
  }

  if (ct.secciones?.length) {
    ct.secciones = ct.secciones.map((section) => {
      if (!section.imagen) return section;
      if (typeof section.imagen === 'object' && section.imagen !== null && section.imagen.url) {
        return {
          ...section,
          imagen: {
            ...section.imagen,
            url: processImageUrlForDisplay(section.imagen.url),
          },
        };
      }
      return { ...section, imagen: processImageUrlForDisplay(section.imagen) };
    });
  }

  if (ct.seccionesPersonalizadas?.length) {
    ct.seccionesPersonalizadas = ct.seccionesPersonalizadas.map((section) => {
      if (!section.imagen) return section;
      if (typeof section.imagen === 'object' && section.imagen !== null && section.imagen.url) {
        return {
          ...section,
          imagen: {
            ...section.imagen,
            url: processImageUrlForDisplay(section.imagen.url),
          },
        };
      }
      return { ...section, imagen: processImageUrlForDisplay(section.imagen) };
    });
  }

  if (ct.banner?.length) {
    ct.banner = ct.banner.map((item) => {
      if (typeof item === 'object' && item.url) {
        return { ...item, url: processImageUrlForDisplay(item.url) };
      }
      if (typeof item === 'string') return processImageUrlForDisplay(item);
      return item;
    });
  }

  if (ct.bannerPrincipal?.length) {
    ct.bannerPrincipal = ct.bannerPrincipal.map((item) => {
      if (typeof item === 'object' && item.url) {
        return { ...item, url: processImageUrlForDisplay(item.url) };
      }
      if (typeof item === 'string') return processImageUrlForDisplay(item);
      return item;
    });
    if (!ct.banner?.length) {
      ct.banner = ct.bannerPrincipal;
    }
  }

  if (Array.isArray(ct.carrusel) && ct.carrusel.length) {
    let cacheUpdated = false;
    ct.carrusel.forEach((item) => {
      if (item.url && item._id) {
        const processedUrl = processImageUrlForDisplay(item.url);
        carruselImagesCache.set(item._id, processedUrl);
        cacheUpdated = true;
      }
    });
    if (cacheUpdated) saveImageCacheToStorage();
  }

  if (ct.videos?.length) {
    ct.videos = ct.videos.map((v) => ({
      ...v,
      url: typeof v.url === 'string' ? resolveApiMediaUrl(v.url) : v.url,
    }));
  }

  return ct;
};

const applyMediaToStoreConfigPayload = (payload) => {
  if (payload?.configuracionTienda) {
    applyMediaToConfiguracionTienda(payload.configuracionTienda);
  }
  return payload;
};

/** GET /api/tiendas/:slug — documentación: respuesta liviana (sin banner/carrusel/secciones/videos pesados). */
export const getStoreBySlug = async (slug) => {
  const res = await axiosWithConfig.get(`/api/tiendas/${slug}?t=${Date.now()}`);
  return res.data;
};

// Obtener la configuración de la tienda por slug (admin: JWT + rol admin/superAdmin)
export const getStoreConfig = async (slug) => {
  try {
    const timestamp = new Date().getTime();
    const response = await axiosWithConfig.get(`/api/tiendas/${slug}/configuracion?t=${timestamp}`);

    applyMediaToStoreConfigPayload(response.data);

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

/**
 * GET /api/tiendas/:slug/configuracion/publica — banner, carrusel, secciones, videos activos (base64 / data URL).
 * Sin token. Misma normalización de URLs que la config admin.
 */
export const getPublicStoreConfiguration = async (slug) => {
  const timestamp = Date.now();
  const res = await axiosWithConfig.get(
    `/api/tiendas/${slug}/configuracion/publica?t=${timestamp}`
  );
  applyMediaToStoreConfigPayload(res.data);
  return res.data;
};

/**
 * GET /api/tiendas/:slug/videos — solo activos. `video.url` data URL o legacy `/videos/...`.
 */
export const getPublicStoreVideos = async (slug) => {
  const res = await axiosWithConfig.get(`/api/tiendas/${slug}/videos?t=${Date.now()}`);
  const videos = res.data?.videos;
  if (!Array.isArray(videos)) return res.data;
  return {
    ...res.data,
    videos: videos.map((v) => ({
      ...v,
      url: typeof v.url === 'string' ? resolveApiMediaUrl(v.url) : v.url,
    })),
  };
};

/**
 * Para la web pública: combina la tienda liviana con la config pública “pesada”
 * (evita leer banner/carrusel solo desde GET /api/tiendas/:slug).
 */
export const mergeTiendaLivianaConConfigPublica = (tiendaDoc, publicConfigPayload) => {
  if (!tiendaDoc || typeof tiendaDoc !== 'object') return publicConfigPayload || tiendaDoc;
  const pubCt = publicConfigPayload?.configuracionTienda;
  if (!pubCt) return tiendaDoc;
  return {
    ...tiendaDoc,
    configuracionTienda: {
      ...(tiendaDoc.configuracionTienda || {}),
      ...pubCt,
    },
  };
};

/** Videos admin: todos (incluye inactivos). */
export const getAdminVideos = async (slug) => {
  const res = await axiosWithConfig.get(`/api/tiendas/${slug}/admin/videos`);
  return res.data;
};

/** Subida: multipart, campo archivo `video`; opcional titulo, descripcion. */
export const uploadAdminVideo = async (slug, formData) => {
  const res = await axiosWithConfig.post(`/api/tiendas/${slug}/admin/videos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateAdminVideo = async (slug, videoId, payload) => {
  const res = await axiosWithConfig.put(`/api/tiendas/${slug}/admin/videos/${videoId}`, payload);
  return res.data;
};

export const deleteAdminVideo = async (slug, videoId) => {
  const res = await axiosWithConfig.delete(`/api/tiendas/${slug}/admin/videos/${videoId}`);
  return res.data;
};

/** Editar sección existente (multipart opcional con nueva imagen). */
export const updateSection = async (slug, sectionId, formData) => {
  const res = await axiosWithConfig.put(
    `/api/tiendas/${slug}/admin/secciones/${sectionId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
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
  getStoreBySlug,
  getPublicStoreConfiguration,
  getPublicStoreVideos,
  mergeTiendaLivianaConConfigPublica,
  applyMediaToConfiguracionTienda,
  getAdminVideos,
  uploadAdminVideo,
  updateAdminVideo,
  deleteAdminVideo,
  updateSection,
  updateLogo,
  updateBanner,
  updateCarrusel,
  addSection,
  deleteSection,
  updateVisual,
  getCarruselImageFromCache,
  getImageByProxy
}; 