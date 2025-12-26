import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatPrice } from '../../utils/formatters';

// Función mejorada para procesar URL de imagen
const getImageUrl = (imageData) => {
  // Si no hay datos, devolver imagen por defecto
  if (!imageData) {
    console.log('Sin datos de imagen, usando imagen por defecto');
    return 'https://via.placeholder.com/300x300?text=Sin+Imagen';
  }
  
  try {
    // Si es un objeto con propiedad url, usar esa url
    if (imageData && typeof imageData === 'object') {
      if (imageData.url) {
        const imageUrl = imageData.url;
        
        // Si ya es una URL completa o un dato base64, devolverlo tal cual
        if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
          return imageUrl;
        }
        
        // Si es base64 sin prefijo
        if (imageUrl.length > 100 && /^[A-Za-z0-9+/=]+$/.test(imageUrl.substring(0, 100))) {
          return `data:image/jpeg;base64,${imageUrl}`;
        }
        
        // Si es una ruta relativa, devolverla directamente
        if (imageUrl.startsWith('/')) {
          return imageUrl;
        }
        
        // En cualquier otro caso, asumir que es una ruta relativa sin slash inicial
        return `/${imageUrl}`;
      }
    }
    
    // Si es una cadena directamente
    if (typeof imageData === 'string') {
      // Si ya es una URL completa o un dato base64, devolverlo tal cual
      if (imageData.startsWith('http') || imageData.startsWith('data:')) {
        return imageData;
      }
      
      // Si es base64 sin prefijo
      if (imageData.length > 100 && /^[A-Za-z0-9+/=]+$/.test(imageData.substring(0, 100))) {
        return `data:image/jpeg;base64,${imageData}`;
      }
      
      // Si es una ruta relativa, devolverla directamente
      if (imageData.startsWith('/')) {
        return imageData;
      }
      
      // En cualquier otro caso, asumir que es una ruta relativa sin slash inicial
      return `/${imageData}`;
    }
  } catch (error) {
    console.error('Error procesando URL de imagen:', error);
  }
  
  // No se pudo procesar la URL de imagen, devolver una imagen por defecto
  console.warn('URL de imagen inválida:', imageData);
  return 'https://via.placeholder.com/300x300?text=Sin+Imagen';
};

// Función para manejar error al cargar imagen
const handleImageError = (e) => {
  console.warn('Error al cargar imagen');
  e.target.src = 'https://via.placeholder.com/300x300?text=Sin+Imagen';
};

const ProductCard = ({ product }) => {
  // Verificar que product sea un objeto válido
  if (!product || typeof product !== 'object') {
    console.error('Producto inválido:', product);
    return null;
  }

  // Formatear precio con descuento
  const calculateDiscountedPrice = (price, discountPercentage) => {
    if (!price || !discountPercentage) return price;
    return price - (price * (discountPercentage / 100));
  };

  // Obtener URL de la imagen principal
  const getMainImageUrl = () => {
    if (product.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0) {
      return getImageUrl(product.imagenes[0]);
    }
    return 'https://via.placeholder.com/300x300?text=Sin+Imagen';
  };

  // Datos del producto
  const {
    _id,
    nombre = 'Producto sin nombre',
    precio = 0,
    enOferta = false,
    porcentajeDescuento = 0,
    destacado = false,
  } = product;

  const imageUrl = getMainImageUrl();
  const discountedPrice = enOferta ? calculateDiscountedPrice(precio, porcentajeDescuento) : precio;

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
      {/* Badge de descuento */}
      {enOferta && porcentajeDescuento > 0 && (
        <div className="absolute top-0 right-0 z-10 bg-red-500 text-white px-2 py-1 text-sm font-bold">
          {porcentajeDescuento}% OFF
        </div>
      )}
      
      {/* Badge de destacado */}
      {destacado && (
        <div className="absolute top-0 left-0 z-10 bg-yellow-500 text-white px-2 py-1 text-sm font-bold">
          Destacado
        </div>
      )}
      
      {/* Enlace al detalle del producto */}
      <Link to={`/producto/${_id}`} className="block">
        {/* Imagen del producto */}
        <div className="relative h-60 overflow-hidden bg-gray-200">
          <img
            src={imageUrl}
            alt={nombre}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            onError={handleImageError}
          />
          
          {/* Overlay al hacer hover */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
        
        {/* Información del producto */}
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2 h-14">{nombre}</h3>
          
          <div className="flex items-center justify-between mt-2">
            <div>
              {/* Mostrar precio con descuento si aplica */}
              {enOferta && porcentajeDescuento > 0 ? (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(discountedPrice)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(precio)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(precio)}
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              <span className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ver detalles
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    precio: PropTypes.number,
    imagenes: PropTypes.array,
    enOferta: PropTypes.bool,
    porcentajeDescuento: PropTypes.number,
    destacado: PropTypes.bool,
  }).isRequired,
};

export default ProductCard; 