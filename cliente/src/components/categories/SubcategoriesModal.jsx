import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import categoryService from '../../services/categoryService';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

const SubcategoriesModal = ({ isOpen, onClose, category }) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (isOpen && category?._id) {
        try {
          setLoading(true);
          setError(null);
          const data = await categoryService.getSubcategories(category._id);
          setSubcategories(data);
        } catch (err) {
          console.error('Error al cargar subcategorías:', err);
          setError('No se pudieron cargar las subcategorías. Por favor, intente nuevamente.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSubcategories();
  }, [isOpen, category]);

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Subcategorías</h3>
              <p className="text-sm text-gray-400 mt-1">
                Categoría: <span className="text-primary-400">{category?.nombre}</span>
              </p>
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
        
        {/* Contenido */}
        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Cargando subcategorías..." />
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
        ) : subcategories.length === 0 ? (
          <EmptyState
            icon="🏷️"
            title="No hay subcategorías"
            description="Esta categoría aún no tiene subcategorías asociadas"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((subcat) => (
                  <tr key={subcat._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <span className="font-medium text-white">{subcat.nombre}</span>
                      </div>
                    </td>
                    <td className="text-gray-300">{subcat.descripcion || 'Sin descripción'}</td>
                    <td>
                      <StatusBadge status={subcat.isActive !== false ? 'active' : 'inactive'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            {subcategories.length} subcategoría{subcategories.length !== 1 ? 's' : ''}
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

SubcategoriesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.object,
};

export default SubcategoriesModal;
