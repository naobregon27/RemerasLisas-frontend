// Función para obtener datos de la primera imagen de un producto de manera confiable
// Esta función está optimizada para manejar diferentes formatos de imágenes

import { isBase64, formatBase64 } from '../../config/apiConfig';

/**
 * Obtiene la primera imagen válida de un producto y la procesa para su visualización
 * @param {Object} product - El objeto producto completo
 * @returns {Object} Un objeto con la información de la imagen y su URL procesada
 */
export const getFirstImageData = (product) => {
  if (!product) {
    console.warn('getFirstImageData: producto no proporcionado');
    return { data: null, url: 'https://via.placeholder.com/300x300?text=Sin+Imagen' };
  }
  
  try {
    // Comprobar si existe la propiedad imagenes y si tiene contenido
    if (product.imagenes) {
      let imagenes = product.imagenes;
      const productName = product.nombre || 'Producto sin nombre';
      
      // Validar el formato de las imágenes
      console.log(`[${productName}] Formato original de imagenes:`, {
        tipo: typeof imagenes,
        valor: Array.isArray(imagenes) ? `Array con ${imagenes.length} elementos` : typeof imagenes
      });
      
      // Si es un string que parece JSON, intentar parsearlo
      if (typeof imagenes === 'string' && imagenes.trim().startsWith('[')) {
        try {
          imagenes = JSON.parse(imagenes);
          console.log(`[${productName}] Array de imágenes parseado:`, imagenes);
        } catch (e) {
          console.error(`[${productName}] Error parseando array de imágenes:`, e);
        }
      }
      
      // Convertir a array si no lo es
      if (!Array.isArray(imagenes)) {
        imagenes = imagenes ? [imagenes] : [];
        console.log(`[${productName}] Convertido a array:`, imagenes);
      }
      
      // Si tiene elementos
      if (imagenes.length > 0) {
        let imageData = imagenes[0];
        
        // Procesamiento específico según el tipo de dato
        if (typeof imageData === 'object' && imageData !== null) {
          // Si es un objeto con propiedad url, usar esa url
          if (imageData.url) {
            console.log(`[${productName}] Encontrada imagen con URL:`, 
                      typeof imageData.url === 'string' && imageData.url.length > 50 ? 
                      imageData.url.substring(0, 50) + '...' : imageData.url);
            
            // Verificar si es base64 sin prefijo o con prefijo incorrecto
            if (typeof imageData.url === 'string') {
              // Si parece base64, formatear correctamente
              if (isBase64(imageData.url)) {
                return {
                  data: imageData,
                  url: formatBase64(imageData.url)
                };
              }
              
              // Si ya tiene formato data:image, usarla directamente
              if (imageData.url.startsWith('data:')) {
                console.log(`[${productName}] URL ya tiene formato data:image, usando directamente`);
                return {
                  data: imageData,
                  url: imageData.url
                };
              }
            }
            
            // Caso general, devolver URL tal cual
            return {
              data: imageData,
              url: imageData.url
            };
          }
        } else if (typeof imageData === 'string') {
          // Si es string que parece ser base64
          if (isBase64(imageData)) {
            console.log(`[${productName}] String base64 detectado, formateando correctamente`);
            return {
              data: { url: imageData },
              url: formatBase64(imageData)
            };
          }
          
          // Si es data:image u otro formato, usarlo directamente
          return {
            data: { url: imageData },
            url: imageData
          };
        }
        
        // Si la imagen no tiene url válida, devolver imagen por defecto
        return {
          data: null,
          url: 'https://via.placeholder.com/300x300?text=Sin+Imagen'
        };
      }
    }
  } catch (error) {
    console.error('Error procesando datos de imagen:', error);
  }
  
  // Si no se pudo procesar, devolver imagen por defecto
  return { data: null, url: 'https://via.placeholder.com/300x300?text=Sin+Imagen' };
};

/**
 * Extrae y procesa todas las imágenes de un producto
 * @param {Object} product - El objeto producto completo
 * @returns {Array} Un array de objetos con información de imágenes procesadas
 */
export const getAllProductImages = (product) => {
  if (!product || !product.imagenes) {
    return [];
  }
  
  try {
    let imagenes = product.imagenes;
    const productName = product.nombre || 'Producto sin nombre';
    
    // Si es un string que parece JSON, intentar parsearlo
    if (typeof imagenes === 'string' && imagenes.trim().startsWith('[')) {
      try {
        imagenes = JSON.parse(imagenes);
      } catch (e) {
        console.error(`[${productName}] Error parseando JSON de imágenes:`, e);
      }
    }
    
    // Asegurarse que sea un array
    if (!Array.isArray(imagenes)) {
      imagenes = imagenes ? [imagenes] : [];
    }
    
    // Procesar cada imagen para obtener su URL
    return imagenes.map((img, index) => {
      if (typeof img === 'object' && img !== null && img.url) {
        // Si tiene URL y es base64, formatear correctamente
        if (isBase64(img.url)) {
          return { 
            id: index,
            url: formatBase64(img.url),
            nombre: img.nombre || `Imagen ${index + 1}`
          };
        }
        
        // Si no es base64, usar la URL tal cual
        return { 
          id: index,
          url: img.url,
          nombre: img.nombre || `Imagen ${index + 1}`
        };
      } else if (typeof img === 'string') {
        // Si el string es base64, formatear correctamente
        if (isBase64(img)) {
          return { 
            id: index,
            url: formatBase64(img),
            nombre: `Imagen ${index + 1}`
          };
        }
        
        // Si no es base64, usar el string tal cual
        return { 
          id: index,
          url: img,
          nombre: `Imagen ${index + 1}`
        };
      }
      
      // Si no se puede determinar, intentar convertir a string
      return { 
        id: index,
        url: String(img),
        nombre: `Imagen ${index + 1}`
      };
    });
  } catch (error) {
    console.error('Error procesando imágenes del producto:', error);
    return [];
  }
}; 