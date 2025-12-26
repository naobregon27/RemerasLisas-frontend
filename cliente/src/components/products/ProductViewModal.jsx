import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const API_BASE_URL = 'https://e-commerce-backend-flmk.onrender.com';

const ProductViewModal = ({ isOpen, onClose, product }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState({});

  useEffect(() => {
    if (isOpen && product?.imagenes && Array.isArray(product.imagenes)) {
      const newLoadingState = {};
      product.imagenes.forEach((_, index) => {
        newLoadingState[`img-${index}`] = 'loading';
      });
      setLoadingImages(newLoadingState);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-';
    return price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  const getImageUrl = (imageData) => {
    if (imageData && typeof imageData === 'object' && imageData.url) {
      const imageUrl = imageData.url;
      if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
      if (imageUrl.startsWith('/')) return `${API_BASE_URL}${imageUrl}`;
      return `${API_BASE_URL}/${imageUrl}`;
    }
    
    if (typeof imageData === 'string') {
      if (imageData.startsWith('http') || imageData.startsWith('data:')) return imageData;
      if (imageData.startsWith('/')) return `${API_BASE_URL}${imageData}`;
      return `${API_BASE_URL}/${imageData}`;
    }
    
    return null;
  };

  const handleImageError = (e, index) => {
    e.target.src = 'https://via.placeholder.com/400?text=Imagen+no+disponible';
    setLoadingImages(prev => ({ ...prev, [`img-${index}`]: 'error' }));
  };

  const hasValidImages = () => product?.imagenes && Array.isArray(product.imagenes) && product.imagenes.length > 0;
  const activeImageUrl = hasValidImages() && product.imagenes[activeImageIndex] ? getImageUrl(product.imagenes[activeImageIndex]) : null;

  const tabs = [
    { id: 'info', label: 'Información', icon: '📝' },
    { id: 'caracteristicas', label: 'Características', icon: '⭐' },
    { id: 'variantes', label: 'Variantes', icon: '🎨' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-5xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/20">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Detalles del Producto</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-primary'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imágenes */}
            <div className="glass-card p-4">
              {hasValidImages() && activeImageUrl ? (
                <div>
                  <div className="relative h-80 rounded-xl overflow-hidden bg-white/5 mb-3">
                    {loadingImages[`img-${activeImageIndex}`] === 'loading' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                      </div>
                    )}
                    <img 
                      src={activeImageUrl}
                      alt={`${product.nombre} - ${activeImageIndex + 1}`} 
                      className="w-full h-full object-contain"
                      onLoad={() => setLoadingImages(prev => ({ ...prev, [`img-${activeImageIndex}`]: 'loaded' }))}
                      onError={(e) => handleImageError(e, activeImageIndex)}
                      style={{ display: loadingImages[`img-${activeImageIndex}`] === 'loading' ? 'none' : 'block' }}
                    />
                  </div>
                  {product.imagenes.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {product.imagenes.map((img, index) => {
                        const thumbUrl = getImageUrl(img);
                        return thumbUrl && (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              activeImageIndex === index ? 'border-primary-400 shadow-glow-primary' : 'border-white/20 hover:border-white/40'
                            }`}
                          >
                            <img src={thumbUrl} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" onError={(e) => handleImageError(e, index)} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Sin imágenes</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información según tab activo */}
            <div className="glass-card p-4 space-y-4">
              {activeTab === 'info' && (
                <>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">{product.nombre}</h4>
                    <p className="text-gray-300">{product.descripcion}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-gray-400">Precio:</span>
                      <span className="text-xl font-bold text-primary-400">{formatPrice(product.precio)}</span>
                    </div>
                    {product.precioAnterior && product.precioAnterior > product.precio && (
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-gray-400">Precio anterior:</span>
                        <span className="line-through text-gray-500">{formatPrice(product.precioAnterior)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-gray-400">Stock:</span>
                      <span className="text-white font-medium">{product.stock || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-gray-400">Categoría:</span>
                      <span className="text-white">{product.categoria?.nombre || 'N/A'}</span>
                    </div>
                    {product.etiquetas && product.etiquetas.length > 0 && (
                      <div className="pt-2">
                        <span className="text-gray-400 text-sm block mb-2">Etiquetas:</span>
                        <div className="flex flex-wrap gap-2">
                          {product.etiquetas.map((tag, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg bg-primary-500/20 text-primary-300 text-xs">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-2">
                      {product.destacado && <span className="px-3 py-1 rounded-lg bg-warning-500/20 text-warning-300 text-xs font-medium">⭐ Destacado</span>}
                      {product.enOferta && <span className="px-3 py-1 rounded-lg bg-success-500/20 text-success-300 text-xs font-medium">🏷️ En Oferta</span>}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'caracteristicas' && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Características</h4>
                  {product.caracteristicas && product.caracteristicas.length > 0 ? (
                    <div className="space-y-2">
                      {product.caracteristicas.map((car, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-white/10">
                          <span className="text-gray-400">{car.nombre}:</span>
                          <span className="text-white">{car.valor}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No hay características definidas</p>
                  )}
                </div>
              )}

              {activeTab === 'variantes' && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Variantes</h4>
                  {product.variantes && product.variantes.length > 0 ? (
                    <div className="space-y-4">
                      {product.variantes.map((variante, index) => (
                        <div key={index} className="glass-card p-3 bg-white/5">
                          <h5 className="font-medium text-white mb-2">{variante.nombre}</h5>
                          <div className="space-y-2">
                            {variante.opciones && variante.opciones.map((opcion, i) => (
                              <div key={i} className="flex justify-between text-sm py-1">
                                <span className="text-gray-300">{opcion.valor}</span>
                                <div className="flex gap-2 text-gray-400">
                                  <span>{formatPrice(opcion.precio)}</span>
                                  <span>•</span>
                                  <span>Stock: {opcion.stock}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No hay variantes definidas</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-6 border-t border-white/10">
          <button onClick={onClose} className="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

ProductViewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
};

export default ProductViewModal;
