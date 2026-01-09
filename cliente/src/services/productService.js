import axiosInstance from './axiosConfig';
import { isBase64, formatBase64 } from '../config/apiConfig';

// Función para dividir las imágenes base64 grandes en partes más pequeñas si es necesario
const procesarProductoParaEnvio = (productData) => {
  // Clonar el objeto para no modificar el original
  const processedData = { ...productData };
  
  // Verificamos si hay imágenes disponibles
  if (!processedData.imagenes || !Array.isArray(processedData.imagenes) || processedData.imagenes.length === 0) {
    console.log('No hay imágenes para procesar');
    return processedData;
  }
  
  // Limitar a máximo 5 imágenes
  if (processedData.imagenes.length > 5) {
    processedData.imagenes = processedData.imagenes.slice(0, 5);
    console.warn('Se han limitado las imágenes a un máximo de 5');
  }
  
  // Log de depuración para ver el formato de las imágenes antes de procesar
  if (processedData.imagenes.length > 0) {
    const firstImg = processedData.imagenes[0];
    console.log('Primera imagen antes de procesar:', {
      tipo: typeof firstImg,
      esObjeto: typeof firstImg === 'object' && firstImg !== null,
      tieneURL: typeof firstImg === 'object' && firstImg !== null && 'url' in firstImg,
      urlTipo: typeof firstImg === 'object' && firstImg !== null && 'url' in firstImg ? 
              typeof firstImg.url : 'N/A',
      urlEsBase64: typeof firstImg === 'object' && firstImg !== null && 'url' in firstImg && 
                  typeof firstImg.url === 'string' ? 
                  firstImg.url.startsWith('data:image') : false
    });
  }
  
  // Convertir cada imagen en un formato adecuado para el servidor
  processedData.imagenes = processedData.imagenes.map((img, index) => {
    console.log(`Procesando imagen ${index}:`, typeof img === 'object' ? 'objeto' : typeof img);
    
    // Si ya es un objeto, verificar si tiene url o si necesita procesamiento
    if (typeof img === 'object' && img !== null) {
      // Verificar si tiene URL
      if (img.url && typeof img.url === 'string') {
        // Verificar si es base64
        if (isBase64(img.url)) {
          // Asegurarse que el formato base64 sea correcto
          return { 
            url: formatBase64(img.url),
            nombre: img.nombre || `imagen-${index}`
          };
        }
        
        // Si no es base64, pero es una cadena larga que parece serlo
        if (img.url.length > 100 && 
            !img.url.startsWith('http') && 
            !img.url.startsWith('/') && 
            /^[A-Za-z0-9+/=]+$/.test(img.url.substring(0, 100))) {
          console.log(`Imagen ${index} parece ser base64 sin prefijo, añadiendo prefijo`);
          return { 
            url: `data:image/jpeg;base64,${img.url}`,
            nombre: img.nombre || `imagen-${index}`
          };
        }
        
        // Si no es base64, mantener la URL tal cual
        console.log(`Imagen ${index} es un objeto con URL`);
        return { 
          url: img.url,
          nombre: img.nombre || `imagen-${index}`
        };
      }
      // Si no tiene URL pero tiene otras propiedades útiles
      return img;
    }
    
    // Si es una cadena (url o base64)
    if (typeof img === 'string') {
      console.log(`Imagen ${index} es una cadena de caracteres`);
      
      // Verificar si es base64
      if (isBase64(img)) {
        return { 
          url: formatBase64(img),
          nombre: `imagen-${index}`
        };
      }
      
      // Si parece base64 sin prefijo
      if (img.length > 100 && 
          !img.startsWith('http') && 
          !img.startsWith('/') && 
          /^[A-Za-z0-9+/=]+$/.test(img.substring(0, 100))) {
        console.log(`Imagen ${index} parece ser base64 sin prefijo, añadiendo prefijo`);
        return { 
          url: `data:image/jpeg;base64,${img}`,
          nombre: `imagen-${index}`
        };
      }
      
      // Si no es base64, mantener como URL normal
      return { 
        url: img,
        nombre: `imagen-${index}`
      };
    }
    
    // Si no es string ni objeto, intentar convertir a string
    return { 
      url: String(img),
      nombre: `imagen-${index}`
    };
  });
  
  // Log de depuración para ver el formato de las imágenes después de procesar
  if (processedData.imagenes.length > 0) {
    const firstImg = processedData.imagenes[0];
    console.log('Primera imagen después de procesar:', {
      tipo: typeof firstImg,
      esObjeto: typeof firstImg === 'object' && firstImg !== null,
      tieneURL: typeof firstImg === 'object' && firstImg !== null && 'url' in firstImg,
      urlTipo: typeof firstImg === 'object' && firstImg !== null && 'url' in firstImg ? 
              typeof firstImg.url : 'N/A',
      urlEsBase64: typeof firstImg === 'object' && firstImg !== null && 'url' in firstImg && 
                  typeof firstImg.url === 'string' ? 
                  firstImg.url.startsWith('data:image') : false
    });
  }
  
  console.log('Imágenes procesadas:', processedData.imagenes.length);
  return processedData;
};

// Función para procesar las imágenes de un producto recibido desde el servidor
const procesarProductoRecibido = (productData) => {
  if (!productData) return productData;
  
  // Clonar el producto para no modificar el original
  const processedProduct = { ...productData };
  
  // Si el producto tiene imágenes, asegurarnos de que estén bien formateadas
  if (processedProduct.imagenes) {
    console.log("Procesando imágenes recibidas del servidor:", JSON.stringify(processedProduct.imagenes).substring(0, 100) + "...");
    
    // Si las imágenes son un array, procesarlas una por una
    if (Array.isArray(processedProduct.imagenes)) {
      processedProduct.imagenes = processedProduct.imagenes.map((img, index) => {
        console.log(`Procesando imagen ${index}:`, typeof img === 'object' ? 'objeto' : typeof img);
        
        // Si es un objeto con propiedad url
        if (typeof img === 'object' && img !== null && img.url) {
          // Si la url parece ser base64 sin prefijo, añadirlo
          if (typeof img.url === 'string' && 
              img.url.length > 100 && 
              !img.url.startsWith('data:') && 
              !img.url.startsWith('http') && 
              !img.url.startsWith('/') && 
              /^[A-Za-z0-9+/=]+$/.test(img.url.substring(0, 100))) {
            console.log(`Corrigiendo formato de imagen ${index}: añadiendo prefijo data:image/jpeg;base64,`);
            return { ...img, url: `data:image/jpeg;base64,${img.url}` };
          }
          return img;
        }
        
        // Si es una cadena que parece base64 sin prefijo
        if (typeof img === 'string' && 
            img.length > 100 && 
            !img.startsWith('data:') && 
            !img.startsWith('http') && 
            !img.startsWith('/') && 
            /^[A-Za-z0-9+/=]+$/.test(img.substring(0, 100))) {
          console.log(`Corrigiendo formato de imagen ${index} (string): añadiendo prefijo data:image/jpeg;base64,`);
          return { url: `data:image/jpeg;base64,${img}` };
        }
        
        // Si es un string normal o cualquier otro caso
        return typeof img === 'string' ? { url: img } : img;
      });
      
      // Verificación final de las imágenes procesadas
      if (processedProduct.imagenes.length > 0) {
        const firstImg = processedProduct.imagenes[0];
        console.log("Primera imagen después de procesar:", {
          tipo: typeof firstImg,
          esObjeto: typeof firstImg === 'object' && firstImg !== null,
          tieneURL: typeof firstImg === 'object' && firstImg !== null && 'url' in firstImg,
          urlTipo: typeof firstImg === 'object' && firstImg !== null && 'url' in firstImg ? 
                  typeof firstImg.url : 'N/A',
          urlInicio: typeof firstImg === 'object' && firstImg !== null && 'url' in firstImg && 
                    typeof firstImg.url === 'string' ? 
                    firstImg.url.substring(0, 30) + '...' : 'N/A'
        });
      }
    } 
    // Si imagenes es un string, convertirlo a array con un elemento
    else if (typeof processedProduct.imagenes === 'string') {
      const imgString = processedProduct.imagenes;
      console.log("Imagen es un string, convirtiendo a array:", imgString.substring(0, 30) + "...");
      
      // Si parece ser base64 sin prefijo
      if (imgString.length > 100 && 
          !imgString.startsWith('data:') && 
          !imgString.startsWith('http') && 
          !imgString.startsWith('/') && 
          /^[A-Za-z0-9+/=]+$/.test(imgString.substring(0, 100))) {
        processedProduct.imagenes = [
          { url: `data:image/jpeg;base64,${imgString}` }
        ];
      } else {
        processedProduct.imagenes = [{ url: imgString }];
      }
    }
  }
  
  return processedProduct;
};

const productService = {
  // Obtener todos los productos del local
  getProductsByLocal: async (localId) => {
    try {
      const response = await axiosInstance.get(`/api/productos/local/${localId}`);
      
      // La respuesta ahora incluye productos y paginación
      if (response.data && response.data.productos) {
        // Procesar las imágenes de cada producto
        const processedProducts = response.data.productos.map(product => procesarProductoRecibido(product));
        return {
          productos: processedProducts,
          paginacion: response.data.paginacion
        };
      }
      
      return {
        productos: [],
        paginacion: {
          total: 0,
          paginas: 0,
          paginaActual: 1,
          porPagina: 10
        }
      };
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener productos' };
    }
  },

  // Obtener un producto específico
  getProduct: async (productId) => {
    try {
      const response = await axiosInstance.get(`/api/productos/${productId}`);
      
      // Procesar las imágenes del producto
      const processedProduct = procesarProductoRecibido(response.data);
      
      return processedProduct;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el producto' };
    }
  },

  // Obtener productos por categoría
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/api/productos/categoria/${categoryId}`);
      
      // Determinar el formato de la respuesta
      let productsList = [];
      if (Array.isArray(response.data)) {
        productsList = response.data;
      } else if (response.data && Array.isArray(response.data.productos)) {
        productsList = response.data.productos;
      } else {
        console.warn('La respuesta de productos por categoría no tiene un formato válido:', response.data);
        productsList = [];
      }
      
      // Procesar las imágenes de cada producto
      productsList = productsList.map(product => procesarProductoRecibido(product));
      
      return productsList;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener productos por categoría' };
    }
  },

  // Crear un nuevo producto
  createProduct: async (productData) => {
    try {
      console.log('📦 Creando producto con datos:', {
        nombre: productData.nombre,
        precio: productData.precio,
        categoria: productData.categoria,
        local: productData.local,
        imagenes: productData.imagenes?.length || 0
      });

      // Crear FormData
      const formData = new FormData();
      
      // Agregar campos básicos requeridos
      formData.append('nombre', productData.nombre || '');
      formData.append('descripcion', productData.descripcion || '');
      formData.append('precio', productData.precio || 0);
      formData.append('precioAnterior', productData.precioAnterior || 0);
      formData.append('stock', productData.stock || 0);
      
      // ⚠️ IMPORTANTE: Extraer solo el _id de categoria y local si son objetos
      // El backend requiere solo el ID como string, NO el objeto completo
      const categoriaId = typeof productData.categoria === 'object' && productData.categoria !== null
        ? productData.categoria._id
        : productData.categoria || '';
      formData.append('categoria', categoriaId);
      
      const localId = typeof productData.local === 'object' && productData.local !== null
        ? productData.local._id
        : productData.local || '';
      formData.append('local', localId);
      
      // ⚠️ IMPORTANTE: Enviar campos booleanos como strings 'true' o 'false'
      // El backend acepta múltiples formatos pero es mejor enviar explícitamente como string
      formData.append('destacado', productData.destacado ? 'true' : 'false');
      formData.append('enOferta', productData.enOferta ? 'true' : 'false');
      formData.append('porcentajeDescuento', productData.porcentajeDescuento || 0);
      
      // Agregar arrays como JSON strings
      if (productData.etiquetas && productData.etiquetas.length > 0) {
        formData.append('etiquetas', JSON.stringify(productData.etiquetas));
      }
      
      if (productData.caracteristicas && productData.caracteristicas.length > 0) {
        formData.append('caracteristicas', JSON.stringify(productData.caracteristicas));
      }
      
      if (productData.variantes && productData.variantes.length > 0) {
        formData.append('variantes', JSON.stringify(productData.variantes));
      }
      
      // Procesar y agregar imágenes como archivos
      if (Array.isArray(productData.imagenes) && productData.imagenes.length > 0) {
        console.log(`🖼️ Procesando ${productData.imagenes.length} imágenes...`);
        
        for (let idx = 0; idx < productData.imagenes.length; idx++) {
          const img = productData.imagenes[idx];
          const imageUrl = typeof img === 'object' && img.url ? img.url : img;
          const imageName = typeof img === 'object' && img.alt ? img.alt : `imagen-${idx}`;
          
          if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image')) {
            try {
              const arr = imageUrl.split(',');
              const mime = arr[0].match(/:(.*?);/)[1];
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const file = new File([u8arr], `${imageName}.jpg`, { type: mime });
              formData.append('imagenes', file);
              console.log(`✅ Imagen ${idx + 1} procesada: ${(file.size / 1024).toFixed(2)} KB`);
            } catch (imgError) {
              console.error(`❌ Error procesando imagen ${idx}:`, imgError);
            }
          }
        }
      }
      
      // Log para debugging
      console.log('📤 Enviando petición POST a /api/productos');
      
      // Determinar endpoint según cantidad de imágenes
      const endpoint = productData.imagenes && productData.imagenes.length > 1 
        ? '/api/productos/multiple' 
        : '/api/productos';
      
      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Producto creado exitosamente:', response.data);
      
      // Asegurar que el producto devuelto tenga las imágenes correctamente formateadas
      const productWithProcessedImages = procesarProductoRecibido(response.data);
      return productWithProcessedImages;
    } catch (error) {
      console.error('❌ Error al crear producto:', error);
      
      if (error.code === 'ERR_NETWORK' || 
          error.message?.includes('Network Error') ||
          error.message?.includes('entity too large')) {
        throw {
          message: 'Las imágenes son demasiado grandes. Por favor, reduzca su tamaño o cantidad.'
        };
      }
      
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        throw error.response.data || { message: 'Error al crear producto' };
      }
      
      throw { message: error.message || 'Error al crear producto' };
    }
  },

  // Actualizar un producto existente
  updateProduct: async (productId, productData) => {
    try {
      console.log('📝 Actualizando producto:', productId, {
        nombre: productData.nombre,
        precio: productData.precio,
        imagenes: productData.imagenes?.length || 0
      });

      // Crear FormData
      const formData = new FormData();
      
      // Agregar campos básicos
      if (productData.nombre) formData.append('nombre', productData.nombre);
      if (productData.descripcion) formData.append('descripcion', productData.descripcion);
      if (productData.precio !== undefined) formData.append('precio', productData.precio);
      if (productData.precioAnterior !== undefined) formData.append('precioAnterior', productData.precioAnterior);
      if (productData.stock !== undefined) formData.append('stock', productData.stock);
      
      // ⚠️ IMPORTANTE: Extraer solo el _id de categoria y local si son objetos
      // El backend requiere solo el ID como string, NO el objeto completo
      const categoriaId = typeof productData.categoria === 'object' && productData.categoria !== null
        ? productData.categoria._id
        : productData.categoria;
      if (categoriaId) formData.append('categoria', categoriaId);
      
      const localId = typeof productData.local === 'object' && productData.local !== null
        ? productData.local._id
        : productData.local;
      if (localId) formData.append('local', localId);
      
      // ⚠️ CRÍTICO: SIEMPRE enviar campos booleanos explícitamente como strings
      // No importa si cambian o no, siempre enviar el valor actual como string
      // Esto evita que se mantengan valores anteriores en el backend
      formData.append('destacado', productData.destacado ? 'true' : 'false');
      formData.append('enOferta', productData.enOferta ? 'true' : 'false');
      if (productData.porcentajeDescuento !== undefined) formData.append('porcentajeDescuento', productData.porcentajeDescuento);
      
      // Agregar arrays como JSON strings
      if (productData.etiquetas) {
        formData.append('etiquetas', JSON.stringify(productData.etiquetas));
      }
      
      if (productData.caracteristicas) {
        formData.append('caracteristicas', JSON.stringify(productData.caracteristicas));
      }
      
      if (productData.variantes) {
        formData.append('variantes', JSON.stringify(productData.variantes));
      }
      
      // Verificar si hay nuevas imágenes (base64)
      let hasNewImages = false;
      if (Array.isArray(productData.imagenes) && productData.imagenes.length > 0) {
        for (const img of productData.imagenes) {
          const imageUrl = typeof img === 'object' && img.url ? img.url : img;
          if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image')) {
            hasNewImages = true;
            break;
          }
        }
      }
      
      // Si hay nuevas imágenes, procesarlas
      if (hasNewImages) {
        console.log('🖼️ Hay imágenes nuevas para actualizar');
        
        // Mantener imágenes existentes (que no son base64)
        formData.append('mantenerImagenesExistentes', 'true');
        
        for (let idx = 0; idx < productData.imagenes.length; idx++) {
          const img = productData.imagenes[idx];
          const imageUrl = typeof img === 'object' && img.url ? img.url : img;
          const imageName = typeof img === 'object' && img.alt ? img.alt : `imagen-${idx}`;
          
          if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image')) {
            try {
              const arr = imageUrl.split(',');
              const mime = arr[0].match(/:(.*?);/)[1];
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const file = new File([u8arr], `${imageName}.jpg`, { type: mime });
              formData.append('imagenes', file);
              console.log(`✅ Imagen ${idx + 1} procesada para actualización`);
            } catch (imgError) {
              console.error(`❌ Error procesando imagen ${idx}:`, imgError);
            }
          }
        }
      }
      
      // Determinar endpoint según cantidad de imágenes nuevas
      const endpoint = hasNewImages && productData.imagenes.length > 1
        ? `/api/productos/${productId}/multiple`
        : `/api/productos/${productId}`;
      
      console.log('📤 Enviando petición PUT a', endpoint);
      
      const response = await axiosInstance.put(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Producto actualizado exitosamente');
      
      // Asegurar que el producto devuelto tenga las imágenes correctamente formateadas
      const productWithProcessedImages = procesarProductoRecibido(response.data);
      
      return productWithProcessedImages;
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      
      if (error.code === 'ERR_NETWORK' || 
          error.message?.includes('Network Error') ||
          error.message?.includes('entity too large')) {
        throw {
          message: 'Las imágenes son demasiado grandes. Por favor, reduzca su tamaño o cantidad.'
        };
      }
      
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        throw error.response.data || { message: 'Error al actualizar producto' };
      }
      
      throw { message: error.message || 'Error al actualizar producto' };
    }
  },

  // Eliminar un producto
  deleteProduct: async (productId) => {
    try {
      const response = await axiosInstance.delete(`/api/productos/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar producto' };
    }
  },

  // Restaurar/activar un producto eliminado
  restoreProduct: async (productId) => {
    try {
      const response = await axiosInstance.patch(`/api/productos/${productId}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al restaurar producto' };
    }
  }
};

export default productService; 
