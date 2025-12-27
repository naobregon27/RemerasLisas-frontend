import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import categoryService from '../../services/categoryService';
import LoadingSpinner from '../common/LoadingSpinner';
import StatusBadge from '../common/StatusBadge';

const CategoryDetailModal = ({ isOpen, onClose, categoryId }) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (isOpen && categoryId) {
        try {
          setLoading(true);
          setError(null);
          const data = await categoryService.getCategoryById(categoryId);
          setCategory(data);
        } catch (err) {
          console.error('Error al cargar detalles de categoría:', err);
          setError(err.message || 'No se pudieron cargar los detalles de la categoría. Por favor, intente nuevamente.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategoryDetails();
  }, [isOpen, categoryId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-warning-500/20">
              <svg className="w-6 h-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Detalles de la Categoría</h3>
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
        
        {/* Contenido */}
        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Cargando detalles..." />
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-error-500/10 border border-error-400/30">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-error-300 text-sm">{error}</p>
            </div>
          </div>
        ) : category ? (
          <div className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="glass-card p-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Nombre</label>
                <p className="text-lg font-semibold text-white">{category.nombre}</p>
              </div>

              {/* Estado */}
              <div className="glass-card p-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Estado</label>
                <StatusBadge status={category.isActive !== false ? 'active' : 'inactive'} />
              </div>

              {/* Slug */}
              <div className="glass-card p-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Slug</label>
                <p className="text-white font-mono text-sm">{category.slug || 'N/A'}</p>
              </div>

              {/* Fecha de creación */}
              <div className="glass-card p-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Fecha de creación</label>
                <p className="text-white text-sm">
                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="glass-card p-4">
              <label className="text-sm font-medium text-gray-400 mb-2 block">Descripción</label>
              <p className="text-white">{category.descripcion || 'Sin descripción'}</p>
            </div>

            {/* Imagen */}
            {category.imagen && (
              <div className="glass-card p-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Imagen</label>
                <div className="mt-2">
                  <img 
                    src={category.imagen} 
                    alt={category.nombre}
                    className="max-w-full h-auto rounded-xl max-h-64 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Información del local */}
            {category.local && (
              <div className="glass-card p-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Local</label>
                <div className="space-y-2">
                  <p className="text-white font-semibold">
                    {typeof category.local === 'object' ? category.local.nombre : 'N/A'}
                  </p>
                  {typeof category.local === 'object' && category.local.direccion && (
                    <p className="text-gray-300 text-sm">
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {category.local.direccion}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Categoría padre */}
            {category.categoriaPadre && (
              <div className="glass-card p-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Categoría Padre</label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {typeof category.categoriaPadre === 'object' ? category.categoriaPadre.nombre : 'N/A'}
                    </p>
                    {typeof category.categoriaPadre === 'object' && category.categoriaPadre.slug && (
                      <p className="text-gray-400 text-xs font-mono">{category.categoriaPadre.slug}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Fecha de actualización */}
            {category.updatedAt && (
              <div className="glass-card p-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Última actualización</label>
                <p className="text-white text-sm">
                  {new Date(category.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
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

CategoryDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categoryId: PropTypes.string,
};

export default CategoryDetailModal;


