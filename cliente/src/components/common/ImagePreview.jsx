import React, { useState, useRef, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { buildImageUrl, isValidUrl } from '../../config/apiConfig';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar imágenes con manejo de errores
 * Soporta imágenes de rutas, objetos y base64
 */
const ImagePreview = ({ 
  src, 
  alt = 'Imagen', 
  className = 'max-h-full max-w-full object-contain',
  style = {},
  fallbackIcon = true,
  showFileName = true,
  forceRefresh = false,
  refreshKey,
  maxRetries = 3,
  onLoad,
  onError,
  transparentBackground = false
}) => {
  const [error, setError] = useState(false);
  const [processedSrc, setProcessedSrc] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isBase64, setIsBase64] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [compressionAttempted, setCompressionAttempted] = useState(false);
  const imgRef = useRef(null);
  
  // Determina si una cadena es base64
  const isBase64String = (str) => {
    if (!str || typeof str !== 'string') return false;
    // Si ya tiene el prefijo data:, es base64
    if (str.startsWith('data:')) return true;
    
    // Si es una cadena larga sin http y con caracteres base64, probablemente es base64
    if (str.length > 100 && 
        !str.startsWith('http') && 
        !str.startsWith('/') && 
        /^[A-Za-z0-9+/=]+$/.test(str.substring(0, 100))) {
      return true;
    }
    
    return false;
  };
  
  // Extraer el nombre de archivo de una URL
  const extractFileName = (url) => {
    if (!url || typeof url !== 'string') return '';
    
    // Si es base64, devolver un nombre genérico
    if (isBase64String(url)) {
      return 'Imagen base64';
    }
    
    // Intentar extraer nombre de archivo de la ruta
    try {
      // Eliminar parámetros de consulta
      const urlWithoutQuery = url.split('?')[0];
      // Obtener la última parte de la ruta
      const parts = urlWithoutQuery.split('/');
      const filename = parts[parts.length - 1] || 'Imagen';
      
      // Limpiar caracteres problemáticos en el nombre
      return filename
        .replace(/[\[\]\(\){}]/g, '') // eliminar paréntesis, corchetes y llaves
        .replace(/[^\w\-\.]/g, '_'); // reemplazar otros caracteres especiales por guión bajo
    } catch (e) {
      return 'Imagen';
    }
  };
  
  // Formatea correctamente una cadena base64
  const formatBase64 = (data) => {
    if (!data) return null;
    
    // Si ya tiene prefijo data:, devolverla tal cual
    if (data.startsWith('data:')) {
      return data;
    }
    
    // Detectar automáticamente el tipo de imagen según los bytes iniciales
    // Esta es una implementación básica, se podría mejorar con una detección más precisa
    let mimeType = 'image/jpeg'; // Por defecto
    
    // Intentar determinar el tipo de archivo si son datos base64
    try {
      // Descodificar los primeros bytes para verificar la firma del archivo
      const binary = atob(data.substr(0, 32));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Verificar firmas comunes de archivos
      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
        mimeType = 'image/jpeg';
      } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
        mimeType = 'image/png';
      } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
        mimeType = 'image/gif';
      } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
        mimeType = 'image/webp';
      } else if ((bytes[0] === 0x49 && bytes[1] === 0x49) || (bytes[0] === 0x4D && bytes[1] === 0x4D)) {
        mimeType = 'image/tiff';
      }
    } catch (e) {
      console.error('Error detectando tipo de imagen:', e);
      // Si no se puede detectar, usar JPEG por defecto
    }
    
    return `data:${mimeType};base64,${data}`;
  };
  
  // Función para comprimir imágenes si son muy grandes
  const comprimirImagen = async (imageSrc) => {
    if (!isBase64String(imageSrc)) {
      // No podemos comprimir las imágenes que no son base64
      return imageSrc;
    }
    
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          // Si la imagen no es tan grande, no comprimirla
          if (img.width <= 1500 && img.height <= 1500 && imageSrc.length < 1024 * 1024) {
            resolve(imageSrc);
            return;
          }
          
          const canvas = document.createElement('canvas');
          
          // Calcular tamaño proporcional reducido
          let width = img.width;
          let height = img.height;
          let MAX_SIZE;
          let quality;
          
          // Ajustar MAX_SIZE y calidad según el tamaño de la imagen
          const originalSizeMB = imageSrc.length / (1024 * 1024);
          
          if (originalSizeMB > 5 || (width > 3000 || height > 3000)) {
            MAX_SIZE = 1000;
            quality = 0.6;
            console.log("Imagen muy grande detectada, compresión agresiva aplicada");
          } else if (originalSizeMB > 2 || (width > 2000 || height > 2000)) {
            MAX_SIZE = 1200;
            quality = 0.7;
            console.log("Imagen grande detectada, compresión media aplicada");
          } else {
            MAX_SIZE = 1500;
            quality = 0.8;
            console.log("Imagen de tamaño moderado, compresión ligera aplicada");
          }
          
          // Ajustar dimensiones proporcionalmente
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
          
          // Configurar canvas y dibujar imagen redimensionada
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Obtener tipo MIME del original
          const mimeType = imageSrc.split(';')[0].split(':')[1] || 'image/jpeg';
          
          // Comprimir con calidad ajustada
          const compressedBase64 = canvas.toDataURL(mimeType, quality);
          
          console.log(`Imagen comprimida: De ${Math.round(originalSizeMB * 100) / 100}MB a ${Math.round(compressedBase64.length / (1024 * 1024) * 100) / 100}MB`);
          
          if (compressedBase64.length >= imageSrc.length) {
            console.log('La compresión no redujo el tamaño, usando original');
            resolve(imageSrc);
          } else {
            resolve(compressedBase64);
          }
        };
        
        img.onerror = () => {
          console.error('Error al cargar imagen para compresión');
          resolve(imageSrc); // Usar original en caso de error
        };
        
        // En algunos navegadores es necesario asignar primero un onload antes de establecer src
        img.src = imageSrc;
      } catch (error) {
        console.error('Error comprimiendo imagen:', error);
        resolve(imageSrc); // Usar original en caso de error
      }
    });
  };
  
  // Sanitizar URL para evitar problemas con caracteres especiales
  const sanitizeUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    
    // Reemplazar corchetes por sus equivalentes codificados
    if (url.includes('[') || url.includes(']')) {
      url = url.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
    }
    
    // Verificar si la URL ya contiene el protocolo
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      // Si contiene el dominio del backend pero sin protocolo
      if (url.includes('e-commerce-backend-flmk.onrender.com') && !url.startsWith('http')) {
        url = `https://${url}`;
      }
    }
    
    // Evitar doble slash (excepto después de http://)
    url = url.replace(/([^:]\/)\/+/g, "$1");
    
    // Añadir timestamp único para forzar recarga y evitar caché del navegador
    if (!url.startsWith('data:')) {
      // Limpiar posibles timestamps anteriores para evitar URLs muy largas
      url = url.replace(/[?&]t=\d+/g, '');
      
      // Agregar nuevo timestamp
      const timestamp = Date.now() + Math.floor(Math.random() * 1000); // Añadir valor aleatorio para mayor unicidad
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}t=${timestamp}`;
    }
    
    return url;
  };
  
  // Reintentar carga de imagen con URL actualizada
  const retryLoad = async () => {
    if (retryCount >= maxRetries) {
      console.error(`Máximo número de intentos alcanzado (${maxRetries}) para:`, src);
      setError(true);
      setIsLoading(false);
      return;
    }
    
    console.log(`Reintentando carga (${retryCount + 1}/${maxRetries})...`);
    setRetryCount(prev => prev + 1);
    
    // Intentar comprimir la imagen si es el último intento y es base64
    if (retryCount === maxRetries - 1 && isBase64 && !compressionAttempted) {
      try {
        console.log("Intentando comprimir imagen antes del último reintento...");
        setCompressionAttempted(true);
        const compressedImage = await comprimirImagen(processedSrc);
        if (compressedImage !== processedSrc) {
          console.log("Imagen comprimida con éxito, usando versión comprimida");
          setProcessedSrc(compressedImage);
          return; // No procesar más, la actualización de processedSrc activará la recarga
        }
      } catch (err) {
        console.error("Error al comprimir imagen:", err);
      }
    }
    
    // Procesar la imagen nuevamente con timestamp para evitar caché
    processImageSrc();
  };
  
  // Procesar la URL de la imagen
  const processImageSrc = async () => {
    if (!src) {
      setProcessedSrc(null);
      setFileName('');
      setIsLoading(false);
      return;
    }
    
    try {
      // Verificar si es un objeto con url o directamente una url
      let imageUrl = src;
      
      // Si es un objeto con propiedad url, extraer la url
      if (typeof src === 'object' && src !== null) {
        if (src.url) {
          imageUrl = src.url;
        } else if (src.timestamp) { 
          // Si tiene timestamp, usarlo para crear un identificador único
          imageUrl = src.uri || src.path || src.src || '';
        } else {
          // Si es un objeto sin url, intentar usar el objeto directamente como string
          imageUrl = src;
        }
      }
      
      // Determinar si es base64 (después de extraer la URL del objeto)
      const isBase64Img = isBase64String(imageUrl);
      setIsBase64(isBase64Img);
      
      // Procesar según el tipo
      if (isBase64Img) {
        // Es base64, formatear correctamente
        const formattedSrc = formatBase64(imageUrl);
        // Añadir un pseudo-timestamp al final del src base64 para forzar re-renderizado
        setProcessedSrc(`${formattedSrc}#${refreshKey || Date.now()}`);
        setFileName('Imagen');
      } else {
        // Procesar URL con buildImageUrl para asegurar formato correcto
        // Siempre forzar refresh cuando cambia refreshKey
        const url = buildImageUrl(imageUrl, true);
        
        // Sanitizar URL en caso de rutas problemáticas y añadir timestamp
        const cleanUrl = sanitizeUrl(url);
        setProcessedSrc(cleanUrl);
        
        // Extraer nombre de archivo
        setFileName(extractFileName(cleanUrl));
        
        console.log("URL procesada para imagen:", cleanUrl);
      }
    } catch (err) {
      console.error('Error procesando imagen:', err);
      setError(true);
    } finally {
      // No desactivar isLoading aquí, se hará cuando la imagen cargue o de error
    }
  };
  
  // Efecto para procesar la URL de la imagen cuando cambia la prop src
  useEffect(() => {
    setError(false);
    setIsLoading(true);
    setRetryCount(0);
    setCompressionAttempted(false);
    
    // Forzar un retraso mínimo para asegurar que la imagen se recargue
    const timer = setTimeout(() => {
      processImageSrc();
    }, 50);  // Pequeño retraso para asegurar que React reconozca el cambio
    
    return () => clearTimeout(timer);
  }, [src, forceRefresh, refreshKey]);
  
  // Manejar eventos de carga y error de la imagen
  const handleImageLoad = () => {
    console.log("Imagen cargada correctamente:", fileName);
    setIsLoading(false);
    setError(false);
    if (onLoad) onLoad();
  };
  
  const handleImageError = () => {
    console.error("Error cargando imagen:", processedSrc);
    
    // Si aún podemos reintentar, hacerlo
    if (retryCount < maxRetries) {
      retryLoad();
    } else {
      setError(true);
      setIsLoading(false);
      if (onError) onError();
    }
  };
  
  // Renderizar icono de error o placeholder
  if (error) {
    return (
      <div className={`flex items-center justify-center ${className} bg-gray-100 rounded-md`} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        ...style
      }}>
        {fallbackIcon ? (
          <div className="text-center p-2">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mt-1 text-xs text-gray-500">Error al cargar la imagen</p>
            {showFileName && fileName && (
              <p className="text-xs text-gray-400 truncate max-w-xs">{fileName}</p>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500">Error</div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`image-preview-container relative ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      background: transparentBackground ? 'transparent' : undefined,
      backgroundColor: transparentBackground ? 'transparent' : undefined,
      ...style
    }}>
      {/* Patrón de cuadrícula para transparencia si está habilitado */}
      {transparentBackground && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%)
            `,
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            zIndex: 0
          }}
        />
      )}
      
      {isLoading && !error && (
        <div className={`loading-indicator absolute inset-0 flex items-center justify-center z-10 ${transparentBackground ? 'bg-transparent' : 'bg-gray-100 bg-opacity-50'}`}>
          <FaSpinner className={`animate-spin text-xl ${transparentBackground ? 'text-primary-400' : 'text-blue-500'}`} />
        </div>
      )}
      
      {processedSrc && (
        <>
          <img
            ref={imgRef}
            src={processedSrc}
            alt={alt}
            className="image-preview max-w-full max-h-full relative z-10"
            style={{
              objectFit: 'contain',
              display: isLoading ? 'none' : 'block',
              width: 'auto',
              height: 'auto',
              background: 'transparent',
              backgroundColor: 'transparent',
              imageRendering: 'auto'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            crossOrigin="anonymous"
            key={refreshKey || Date.now()} // Añadir key para forzar recreación del elemento
          />
          
          {showFileName && fileName && !isLoading && (
            <p className="mt-1 text-xs text-gray-500 truncate max-w-full">{fileName}</p>
          )}
        </>
      )}
    </div>
  );
};

ImagePreview.propTypes = {
  src: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  fallbackIcon: PropTypes.bool,
  showFileName: PropTypes.bool,
  forceRefresh: PropTypes.bool,
  refreshKey: PropTypes.any,
  maxRetries: PropTypes.number,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  transparentBackground: PropTypes.bool
};

export default ImagePreview; 