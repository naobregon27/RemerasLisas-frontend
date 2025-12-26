import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ProductTable from './ProductTable';
import ProductModal from './ProductModal';
import ProductViewModal from './ProductViewModal';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';

const ProductsManagement = () => {
  const { user, profileData } = useSelector(state => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const localId = profileData?.local?._id || user?.local?._id;

  useEffect(() => {
    if (localId) {
      fetchProducts();
      fetchCategories();
    }
  }, [localId]);

  useEffect(() => {
    if (filterCategory) {
      fetchProductsByCategory(filterCategory);
    } else if (localId) {
      fetchProducts();
    }
  }, [filterCategory]);

  const fetchProducts = useCallback(async () => {
    if (!localId) {
      setError('No se pudo obtener el ID del local');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProductsByLocal(localId);
      
      const productsList = response.productos || [];
      
      const processedProducts = productsList.map(product => {
        if (product.imagenes) {
          if (typeof product.imagenes === 'string' && product.imagenes.trim().startsWith('[')) {
            try {
              product.imagenes = JSON.parse(product.imagenes);
            } catch (e) {
              console.error('Error parseando array de imágenes:', e);
              product.imagenes = [];
            }
          }
          
          if (!Array.isArray(product.imagenes)) {
            product.imagenes = product.imagenes ? [product.imagenes] : [];
          }
        }
        
        return product;
      });
      
      setProducts(processedProducts);
      setPagination({
        current: response.paginacion?.paginaActual || 1,
        pageSize: response.paginacion?.porPagina || 10,
        total: response.paginacion?.total || 0
      });
      
      toast.success(`${processedProducts.length} productos cargados`, { icon: '📦' });
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron cargar los productos. Intente nuevamente.');
      setProducts([]);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [localId]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategoriesByLocal(localId);
      setCategories(data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      toast.error('Error al cargar categorías');
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const data = await productService.getProductsByCategory(categoryId);
      setProducts(data);
    } catch (err) {
      console.error('Error al cargar productos por categoría:', err);
      setError('Error al cargar productos por categoría');
      toast.error('Error al filtrar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      toast.success('Producto eliminado exitosamente', { icon: '🗑️' });
      fetchProducts();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      toast.error('Error al eliminar producto');
    }
  };

  const handleCloseModal = () => {
    setIsProductModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (selectedProduct) {
        // Actualizar producto existente
        await productService.updateProduct(selectedProduct._id, productData);
        toast.success('Producto actualizado exitosamente', { icon: '✅' });
      } else {
        // Crear nuevo producto
        await productService.createProduct(productData);
        toast.success('Producto creado exitosamente', { icon: '✅' });
      }
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      throw error; // Re-lanzar el error para que el modal lo maneje
    }
  };

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(product =>
    product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando productos..." />;
  }

  if (error) {
    return <ErrorState title="Error" message={error} onRetry={fetchProducts} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-title">Gestión de Productos</h1>
            <p className="text-gray-400 mt-1">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar productos
            </label>
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
                placeholder="Buscar por nombre o descripción..."
                className="input-modern pl-10"
              />
            </div>
          </div>

          {/* Filtro por categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filtrar por categoría
            </label>
            <select
              value={filterCategory || ''}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              className="select-modern"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros activos */}
        {(searchTerm || filterCategory) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="badge badge-info flex items-center gap-2">
                Búsqueda: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filterCategory && (
              <span className="badge badge-info flex items-center gap-2">
                Categoría: {categories.find(c => c._id === filterCategory)?.nombre}
                <button onClick={() => setFilterCategory(null)} className="hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabla de productos */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No hay productos"
          description={searchTerm || filterCategory ? 
            "No se encontraron productos con los filtros aplicados" : 
            "Aún no has agregado productos a tu tienda"}
          action={
            !searchTerm && !filterCategory && (
              <button onClick={handleAddProduct} className="btn-primary">
                Agregar Primer Producto
              </button>
            )
          }
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <ProductTable
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onView={handleViewProduct}
            pagination={pagination}
          />
        </div>
      )}

      {/* Modales */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSave={handleSaveProduct}
        categories={categories}
        localId={localId}
      />
      
      <ProductViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductsManagement;
