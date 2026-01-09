import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CategoryTable from './CategoryTable';
import CategoryModal from './CategoryModal';
import SubcategoriesModal from './SubcategoriesModal';
import CategoryDetailModal from './CategoryDetailModal';
import categoryService from '../../services/categoryService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';

const CategoriesManagement = () => {
  const { user, profileData } = useSelector(state => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcatModalOpen, setIsSubcatModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, category: null, action: null });

  const localId = profileData?.local?._id || user?.local?._id;

  useEffect(() => {
    fetchCategories();
  }, [localId]);

  const fetchCategories = async () => {
    if (!localId) {
      setError('No se pudo obtener el ID del local');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Intentar usar el nuevo endpoint que incluye cantidad de productos
      let data;
      try {
        data = await categoryService.getCategoriesWithProductCount(localId);
      } catch (err) {
        // Si el endpoint no existe, usar el endpoint normal como fallback
        console.warn('Endpoint de cantidad de productos no disponible, usando endpoint estándar:', err);
        data = await categoryService.getCategoriesByLocal(localId);
        // Agregar cantidadProductos como 0 si no viene en la respuesta
        data = Array.isArray(data) ? data.map(cat => ({ ...cat, cantidadProductos: cat.cantidadProductos || 0 })) : [];
      }
      setCategories(data);
      toast.success(`${data.length} categorías cargadas`, { icon: '🏷️' });
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('No se pudieron cargar las categorías. Por favor, intente nuevamente.');
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category) => {
    setConfirmDialog({
      isOpen: true,
      category,
      action: 'delete'
    });
  };

  const handleRestoreCategory = (category) => {
    setConfirmDialog({
      isOpen: true,
      category,
      action: 'restore'
    });
  };

  const confirmAction = async () => {
    const { category, action } = confirmDialog;
    
    try {
      if (action === 'delete') {
        await categoryService.deleteCategory(category._id);
        setCategories(prev => prev.map(cat => 
          cat._id === category._id ? { ...cat, isActive: false } : cat
        ));
        toast.success(`Categoría "${category.nombre}" desactivada`, { icon: '🚫' });
      } else if (action === 'restore') {
        await categoryService.restoreCategory(category._id);
        setCategories(prev => prev.map(cat => 
          cat._id === category._id ? { ...cat, isActive: true } : cat
        ));
        toast.success(`Categoría "${category.nombre}" activada`, { icon: '✅' });
      }
    } catch (error) {
      console.error('Error en acción de categoría:', error);
      toast.error('Error al procesar la acción');
    } finally {
      setConfirmDialog({ isOpen: false, category: null, action: null });
    }
  };

  const handleViewSubcategories = (category) => {
    setSelectedCategory(category);
    setIsSubcatModalOpen(true);
  };

  const handleViewProducts = (category) => {
    setSelectedCategory(category);
    setIsProductsModalOpen(true);
  };

  const handleViewDetails = (category) => {
    setSelectedCategoryId(category._id);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCategoryModalOpen(false);
    setIsSubcatModalOpen(false);
    setIsProductsModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedCategory(null);
    setSelectedCategoryId(null);
  };

  const handleCategorySaved = async (formData) => {
    try {
      if (selectedCategory) {
        // Actualizar categoría existente
        await categoryService.updateCategory(selectedCategory._id, {
          ...formData,
          localId: formData.localId || localId
        });
      } else {
        // Crear nueva categoría
        await categoryService.createCategory({
          ...formData,
          localId: formData.localId || localId
        });
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      throw error; // Re-lanzar para que CategoryModal maneje el error
    }
  };

  // Filtrar categorías
  const filteredCategories = categories.filter(category =>
    category.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCategories = filteredCategories.filter(cat => cat.isActive !== false);
  const inactiveCategories = filteredCategories.filter(cat => cat.isActive === false);

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando categorías..." />;
  }

  if (error) {
    return <ErrorState title="Error" message={error} onRetry={fetchCategories} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-title">Gestión de Categorías</h1>
            <p className="text-gray-400 mt-1">
              {activeCategories.length} activas • {inactiveCategories.length} inactivas
            </p>
          </div>
          <button
            onClick={handleAddCategory}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Categoría
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="glass-card p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categorías..."
            className="input-modern pl-10"
          />
        </div>
      </div>

      {/* Lista de categorías */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No hay categorías"
          description={searchTerm ? 
            "No se encontraron categorías con el término de búsqueda" : 
            "Aún no has creado categorías para organizar tus productos"}
          action={
            !searchTerm && (
              <button onClick={handleAddCategory} className="btn-primary">
                Crear Primera Categoría
              </button>
            )
          }
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <CategoryTable
            categories={filteredCategories}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onRestore={handleRestoreCategory}
            onViewSubcategories={handleViewSubcategories}
            onViewProducts={handleViewProducts}
            onViewDetails={handleViewDetails}
          />
        </div>
      )}

      {/* Modales */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseModal}
        category={selectedCategory}
        onSave={handleCategorySaved}
      />

      <SubcategoriesModal
        isOpen={isSubcatModalOpen}
        onClose={handleCloseModal}
        category={selectedCategory}
      />

      <CategoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        categoryId={selectedCategoryId}
      />

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, category: null, action: null })}
        onConfirm={confirmAction}
        title={confirmDialog.action === 'delete' ? '¿Desactivar categoría?' : '¿Activar categoría?'}
        message={
          confirmDialog.action === 'delete'
            ? `La categoría "${confirmDialog.category?.nombre}" será desactivada.`
            : `La categoría "${confirmDialog.category?.nombre}" será activada nuevamente.`
        }
        confirmText={confirmDialog.action === 'delete' ? 'Desactivar' : 'Activar'}
        type={confirmDialog.action === 'delete' ? 'danger' : 'info'}
      />
    </div>
  );
};

export default CategoriesManagement;
