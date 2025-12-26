import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

const CategoriesOverviewModal = ({ isOpen, onClose, categories }) => {
  if (!isOpen) return null;

  const activeCategories = categories?.filter(c => c.isActive || c.activa) || [];
  const inactiveCategories = categories?.filter(c => !(c.isActive || c.activa)) || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-5xl"
        onClick={(e) => e.stopPropagation()}
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
              <h2 className="text-2xl font-bold text-white">Categorías</h2>
              <p className="text-sm text-gray-400">
                {categories?.length || 0} categorías • {activeCategories.length} activas
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
        
        {/* Content */}
        {!categories || categories.length === 0 ? (
          <EmptyState
            icon="🏷️"
            title="No hay categorías"
            description="Aún no se han creado categorías para organizar tus productos"
          />
        ) : (
          <div className="space-y-6">
            {/* Categorías activas */}
            {activeCategories.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                  Categorías Activas ({activeCategories.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCategories.map((category, index) => (
                    <div
                      key={category._id}
                      className="glass-card p-5 hover:border-primary-400/50 transition-all group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-500/20 to-warning-600/20 flex items-center justify-center border border-warning-400/30">
                            <svg className="w-6 h-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-lg">{category.nombre}</h4>
                            <StatusBadge status="active" />
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {category.descripcion || 'Sin descripción'}
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Productos</p>
                          <p className="text-lg font-bold text-primary-400">
                            {category.productCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Subcategorías</p>
                          <p className="text-lg font-bold text-primary-400">
                            {category.subcategories?.length || 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-400 space-y-1">
                        <p>Creada: {new Date(category.createdAt).toLocaleDateString('es-ES')}</p>
                        <p>Actualizada: {new Date(category.updatedAt).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categorías inactivas */}
            {inactiveCategories.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-error-500"></div>
                  Categorías Inactivas ({inactiveCategories.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveCategories.map((category, index) => (
                    <div
                      key={category._id}
                      className="glass-card p-5 opacity-75 hover:opacity-100 hover:border-error-400/50 transition-all"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-error-500/20 flex items-center justify-center border border-error-400/30">
                            <svg className="w-6 h-6 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-lg">{category.nombre}</h4>
                            <StatusBadge status="inactive" />
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {category.descripcion || 'Sin descripción'}
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Productos</p>
                          <p className="text-lg font-bold text-gray-400">
                            {category.productCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Subcategorías</p>
                          <p className="text-lg font-bold text-gray-400">
                            {category.subcategories?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <div className="flex gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success-500"></div>
              {activeCategories.length} activas
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-error-500"></div>
              {inactiveCategories.length} inactivas
            </span>
          </div>
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

export default CategoriesOverviewModal;
