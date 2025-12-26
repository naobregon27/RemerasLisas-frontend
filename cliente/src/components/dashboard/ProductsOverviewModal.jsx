import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

const ProductsOverviewModal = ({ isOpen, onClose, products }) => {
  if (!isOpen) return null;

  const destacados = products?.filter(p => p.destacado || p.featured) || [];
  const enOferta = products?.filter(p => p.enOferta || p.onSale) || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/20">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Vista General de Productos</h2>
              <p className="text-sm text-gray-400">{products?.length || 0} productos totales</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 border-l-4 border-primary-400">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Total de Productos</h3>
            <p className="text-3xl font-bold text-white">{products?.length || 0}</p>
          </div>
          <div className="glass-card p-4 border-l-4 border-warning-400">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Productos Destacados</h3>
            <p className="text-3xl font-bold text-white">{destacados.length}</p>
          </div>
          <div className="glass-card p-4 border-l-4 border-success-400">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Productos en Oferta</h3>
            <p className="text-3xl font-bold text-white">{enOferta.length}</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-6">
          {!products || products.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No hay productos"
              description="Aún no se han agregado productos a tu tienda"
            />
          ) : (
            <>
              {/* Productos Destacados */}
              {destacados.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-warning-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Productos Destacados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {destacados.map((product, index) => (
                      <div
                        key={product._id}
                        className="glass-card p-4 hover:border-warning-400/50 transition-all group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex gap-4">
                          {product.imagenes && product.imagenes[0] && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                              <img
                                src={product.imagenes[0].url}
                                alt={product.imagenes[0].alt || product.nombre}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white truncate mb-1">{product.nombre}</h4>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-2">{product.descripcion}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary-400">${product.precioFinal}</span>
                              <span className="text-sm text-gray-400">Stock: {product.stock}</span>
                            </div>
                          </div>
                        </div>
                        {product.etiquetas && product.etiquetas.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {product.etiquetas.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="badge badge-primary text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Productos en Oferta */}
              {enOferta.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Productos en Oferta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enOferta.map((product, index) => (
                      <div
                        key={product._id}
                        className="glass-card p-4 hover:border-success-400/50 transition-all group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex gap-4">
                          {product.imagenes && product.imagenes[0] && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                              <img
                                src={product.imagenes[0].url}
                                alt={product.imagenes[0].alt || product.nombre}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute top-0 right-0 bg-success-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-bl">
                                OFERTA
                              </div>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white truncate mb-1">{product.nombre}</h4>
                            <p className="text-sm text-gray-400 line-clamp-2 mb-2">{product.descripcion}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-success-400">${product.precioFinal}</span>
                              {product.precioAnterior > 0 && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${product.precioAnterior}
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-400">Stock: {product.stock}</span>
                          </div>
                        </div>
                        {product.etiquetas && product.etiquetas.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {product.etiquetas.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="badge badge-success text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            Mostrando {products?.length || 0} productos
          </p>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsOverviewModal;
