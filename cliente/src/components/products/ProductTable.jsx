import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Pagination from '../shared/Pagination';
import StatusBadge from '../common/StatusBadge';
import { getFirstImageData } from './getFirstImageData';

const ProductTable = ({ 
  products, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const itemsPerPage = 10;

  // Filtrar productos según término de búsqueda
  const filteredProducts = useMemo(() => 
    products.filter(product => 
      product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]
  );

  // Paginar productos
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage]);

  // Resetear página cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getImageUrl = (product) => {
    try {
      const imageData = getFirstImageData(product);
      return imageData?.url || 'https://via.placeholder.com/64x64?text=Sin+Imagen';
    } catch (error) {
      console.error('Error obteniendo imagen:', error);
      return 'https://via.placeholder.com/64x64?text=Error';
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/64x64?text=Sin+Imagen';
    e.target.onerror = null;
  };

  const getStockColor = (stock) => {
    if (stock <= 5) return 'text-error-400';
    if (stock <= 20) return 'text-warning-400';
    return 'text-success-400';
  };

  const getStockIcon = (stock) => {
    if (stock <= 5) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    if (stock <= 20) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Búsqueda interna */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="input-modern pl-10"
            placeholder="Buscar en la tabla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="table-modern">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Última actualización</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <tr key={product._id}>
                  {/* Imagen */}
                  <td>
                    <div 
                      className="relative w-16 h-16 rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => setPreviewImage(product)}
                    >
                      <img
                        src={getImageUrl(product)}
                        alt={product.nombre}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
                      </div>
                    </div>
                  </td>

                  {/* Nombre */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-white">{product.nombre}</p>
                        <div className="flex gap-2 mt-1">
                          {product.destacado && (
                            <span className="badge badge-warning text-xs">⭐ Destacado</span>
                          )}
                          {product.enOferta && (
                            <span className="badge badge-error text-xs">🏷️ Oferta</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td>
                    <span className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-300 text-sm">
                      {product.categoria?.nombre || 'Sin categoría'}
                    </span>
                  </td>

                  {/* Precio */}
                  <td>
                    <div className="flex flex-col">
                      {product.enOferta && product.porcentajeDescuento > 0 ? (
                        <>
                          <span className="text-error-400 font-bold">
                            {formatPrice(product.precio * (1 - product.porcentajeDescuento / 100))}
                          </span>
                          <span className="text-gray-400 line-through text-sm">
                            {formatPrice(product.precio)}
                          </span>
                          <span className="badge badge-error text-xs mt-1">
                            -{product.porcentajeDescuento}%
                          </span>
                        </>
                      ) : (
                        <span className="text-white font-semibold">{formatPrice(product.precio)}</span>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td>
                    <div className={`flex items-center gap-2 ${getStockColor(product.stock)}`}>
                      {getStockIcon(product.stock)}
                      <span className="font-bold">{product.stock}</span>
                    </div>
                  </td>

                  {/* Última actualización */}
                  <td className="text-gray-300 text-sm">
                    {new Date(product.updatedAt || product.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  {/* Acciones */}
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
            <button
                          onClick={() => onView(product)}
                          className="p-2 rounded-lg bg-info-500/20 text-info-400 hover:bg-info-500/30 transition-all"
                          title="Ver detalles"
            >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 rounded-lg bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 transition-all"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(product._id)}
                        className="p-2 rounded-lg bg-error-500/20 text-error-400 hover:bg-error-500/30 transition-all"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
        </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-400">No se encontraron productos</p>
          </div>
                </td>
              </tr>
        )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Modal de preview de imagen */}
      {previewImage && (
        <div 
          className="modal-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="modal-content max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{previewImage.nombre}</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <img
                src={getImageUrl(previewImage)}
                alt={previewImage.nombre}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                onError={handleImageError}
              />
            </div>
            <div className="mt-4 text-gray-300">
              <p className="text-sm">{previewImage.descripcion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func,
};

export default ProductTable; 
