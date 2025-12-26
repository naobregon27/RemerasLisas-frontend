import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

const InventoryDashboard = ({ storeSlug }) => {
  const { user, profileData } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    onSale: 0,
    featured: 0,
  });

  const localId = profileData?.local?._id || user?.local?._id;

  useEffect(() => {
    if (localId) {
      fetchInventoryData();
    }
  }, [localId, filterCategory]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, categoriesData] = await Promise.all([
        productService.getProductsByLocal(localId),
        categoryService.getCategoriesByLocal(localId)
      ]);

      const productsList = productsData.productos || productsData || [];
      
      let filtered = productsList;
      if (filterCategory) {
        filtered = productsList.filter(p => p.categoria?._id === filterCategory);
      }

      setProducts(filtered);
      setCategories(categoriesData || []);

      // Calcular estadísticas
      const calculatedStats = {
        total: filtered.length,
        inStock: filtered.filter(p => p.stock > 10).length,
        outOfStock: filtered.filter(p => p.stock === 0).length,
        lowStock: filtered.filter(p => p.stock > 0 && p.stock <= 10).length,
        onSale: filtered.filter(p => p.enOferta).length,
        featured: filtered.filter(p => p.destacado).length,
      };

      setStats(calculatedStats);
      toast.success('Inventario actualizado', { icon: '📊' });
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError('Error al cargar datos del inventario');
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Cargando inventario..." />;
  }

  if (error) {
    return <ErrorState title="Error" message={error} onRetry={fetchInventoryData} />;
  }

  // Productos con bajo stock
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-title">Panel de Control de Inventario</h1>
            <p className="text-gray-400 mt-1">Gestiona y monitorea tu inventario de forma eficiente</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchInventoryData}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-l-4 border-primary-400 hover:border-primary-300 transition-all hover:shadow-glow-primary">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Productos Totales</p>
            <div className="p-2 rounded-lg bg-primary-500/20">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{stats.total}</p>
          <p className="text-xs text-gray-400">Total en inventario</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-success-400 hover:border-success-300 transition-all hover:shadow-glow-success">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">En Stock</p>
            <div className="p-2 rounded-lg bg-success-500/20">
              <svg className="w-6 h-6 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{stats.inStock}</p>
          <p className="text-xs text-gray-400">Stock mayor a 10 unidades</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-warning-400 hover:border-warning-300 transition-all hover:shadow-glow-warning">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Stock Bajo</p>
            <div className="p-2 rounded-lg bg-warning-500/20">
              <svg className="w-6 h-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{stats.lowStock}</p>
          <p className="text-xs text-gray-400">Stock entre 1 y 10 unidades</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-error-400 hover:border-error-300 transition-all hover:shadow-glow-error">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Agotados</p>
            <div className="p-2 rounded-lg bg-error-500/20">
              <svg className="w-6 h-6 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{stats.outOfStock}</p>
          <p className="text-xs text-gray-400">Sin stock disponible</p>
        </div>
      </div>

      {/* Filtro por categoría */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <label className="block text-sm font-medium text-gray-300">
            Filtrar por categoría
          </label>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="select-modern"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff'
          }}
        >
          <option value="" style={{ backgroundColor: 'rgba(10, 32, 29, 0.98)', color: '#ffffff' }}>
            Todas las categorías
          </option>
          {categories.map(cat => (
            <option 
              key={cat._id} 
              value={cat._id}
              style={{ backgroundColor: 'rgba(10, 32, 29, 0.98)', color: '#ffffff' }}
            >
              {cat.nombre}
            </option>
          ))}
        </select>
        {filterCategory && (
          <button
            onClick={() => setFilterCategory('')}
            className="mt-3 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar filtro
          </button>
        )}
      </div>

      {/* Alertas de stock bajo */}
      {lowStockProducts.length > 0 && (
        <div className="glass-card p-6 border-l-4 border-warning-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-warning-500/20">
              <svg className="w-6 h-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Productos con Stock Bajo</h2>
              <p className="text-sm text-gray-400">{lowStockProducts.length} producto{lowStockProducts.length !== 1 ? 's' : ''} requieren atención</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.slice(0, 6).map(product => (
              <div key={product._id} className="glass-card p-4 border-l-4 border-warning-400 hover:bg-warning-500/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white flex-1">{product.nombre}</h3>
                  <span className="badge badge-warning text-xs ml-2">{product.stock} unidades</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Reabastecer pronto</span>
                </div>
              </div>
            ))}
          </div>
          {lowStockProducts.length > 6 && (
            <p className="text-center text-gray-400 mt-4">
              Y {lowStockProducts.length - 6} productos más con stock bajo
            </p>
          )}
        </div>
      )}

      {/* Productos agotados */}
      {outOfStockProducts.length > 0 && (
        <div className="glass-card p-6 border-l-4 border-error-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-error-500/20">
              <svg className="w-6 h-6 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Productos Agotados</h2>
              <p className="text-sm text-gray-400">{outOfStockProducts.length} producto{outOfStockProducts.length !== 1 ? 's' : ''} sin stock disponible</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outOfStockProducts.slice(0, 6).map(product => (
              <div key={product._id} className="glass-card p-4 border-l-4 border-error-400 hover:bg-error-500/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white flex-1">{product.nombre}</h3>
                  <StatusBadge status="out-of-stock" />
                </div>
                <div className="flex items-center gap-2 text-sm text-error-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Urgente: Reabastecer</span>
                </div>
              </div>
            ))}
          </div>
          {outOfStockProducts.length > 6 && (
            <p className="text-center text-gray-400 mt-4">
              Y {outOfStockProducts.length - 6} productos más agotados
            </p>
          )}
        </div>
      )}

      {/* Estado OK */}
      {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && products.length > 0 && (
        <div className="glass-card p-12 text-center border-2 border-success-400/30 bg-success-500/5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-500/20 mb-6">
            <svg className="w-12 h-12 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">¡Inventario en buen estado!</h3>
          <p className="text-gray-400">Todos tus productos tienen stock suficiente</p>
        </div>
      )}

      {/* Sin productos */}
      {products.length === 0 && (
        <EmptyState
          icon="📦"
          title="No hay productos"
          description="No hay productos en el inventario con los filtros aplicados"
        />
      )}

      {/* Distribución por categoría */}
      {products.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Distribución por Categoría</h2>
          <div className="space-y-3">
            {categories.map(category => {
              const categoryProducts = products.filter(p => p.categoria?._id === category._id);
              const percentage = products.length > 0 ? (categoryProducts.length / products.length * 100).toFixed(1) : 0;
              
              return (
                <div key={category._id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-white">{category.nombre}</span>
                      <span className="text-sm text-gray-400">{categoryProducts.length} productos ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
