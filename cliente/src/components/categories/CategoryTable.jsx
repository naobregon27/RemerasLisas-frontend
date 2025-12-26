import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import Pagination from '../shared/Pagination';
import StatusBadge from '../common/StatusBadge';

const CategoryTable = ({ 
  categories, 
  onEdit, 
  onDelete, 
  onRestore,
  onViewSubcategories,
  onViewProducts 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedCategories, setPaginatedCategories] = useState([]);
  const itemsPerPage = 10;

  // Filtrar categorías según término de búsqueda
  const filteredCategories = useMemo(() => 
    categories.filter(category => 
      category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [categories, searchTerm]
  );

  // Paginar categorías
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedCategories(filteredCategories.slice(startIndex, endIndex));
  }, [filteredCategories, currentPage]);

  // Resetear página cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Búsqueda interna (opcional, ya hay una arriba) */}
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
          Mostrando {paginatedCategories.length} de {filteredCategories.length} categorías
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="table-modern">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Subcategorías</th>
              <th>Productos</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((category) => (
                <tr key={category._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-warning-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-white">{category.nombre}</span>
                    </div>
                  </td>
                  <td className="max-w-xs truncate">{category.descripcion || 'Sin descripción'}</td>
                  <td>
                    <StatusBadge status={category.isActive !== false ? 'active' : 'inactive'} />
                  </td>
                  <td>
                    <button
                      onClick={() => onViewSubcategories(category)}
                      className="flex items-center gap-2 text-accent-400 hover:text-accent-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver ({category.subcategories?.length || 0})
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => onViewProducts(category)}
                      className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Ver ({category.productCount || 0})
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="p-2 rounded-lg bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 transition-all"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {category.isActive !== false ? (
                        <button
                          onClick={() => onDelete(category)}
                          className="p-2 rounded-lg bg-error-500/20 text-error-400 hover:bg-error-500/30 transition-all"
                          title="Desactivar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => onRestore(category)}
                          className="p-2 rounded-lg bg-success-500/20 text-success-400 hover:bg-success-500/30 transition-all"
                          title="Reactivar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-400">No se encontraron categorías</p>
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
    </div>
  );
};

CategoryTable.propTypes = {
  categories: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRestore: PropTypes.func.isRequired,
  onViewSubcategories: PropTypes.func.isRequired,
  onViewProducts: PropTypes.func.isRequired,
};

export default CategoryTable;
