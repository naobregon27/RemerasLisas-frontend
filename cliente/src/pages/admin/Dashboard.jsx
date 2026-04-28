import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, updateUserLocal } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import orderService from '../../services/orderService';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import userService from '../../services/userService';
import localService from '../../services/localService';

// Componentes de gestión
import CategoriesManagement from '../../components/categories/CategoriesManagement';
import ProductsManagement from '../../components/products/ProductsManagement';
import UsersManagement from '../../components/users/UsersManagement';
import OrdersManagement from '../../components/orders/OrdersManagement';
import StoreSettingsPage from '../store/StoreSettingsPage';
import InventoryDashboard from '../../components/inventory/InventoryDashboard';

// Componentes de dashboard
import DashboardStats from '../../components/dashboard/DashboardStats';
import PendingOrdersModal from '../../components/dashboard/PendingOrdersModal';
import RecentUsersModal from '../../components/dashboard/RecentUsersModal';
import ProductsOverviewModal from '../../components/dashboard/ProductsOverviewModal';
import CategoriesOverviewModal from '../../components/dashboard/CategoriesOverviewModal';

// Componentes comunes
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Estados principales
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeSlug, setStoreSlug] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastVisitedAt, setLastVisitedAt] = useState(null);
  
  // Contadores de notificaciones
  const [newUsersCount, setNewUsersCount] = useState(0);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  
  // Modales
  const [isPendingOrdersModalOpen, setIsPendingOrdersModalOpen] = useState(false);
  const [isRecentUsersModalOpen, setIsRecentUsersModalOpen] = useState(false);
  const [isProductsOverviewModalOpen, setIsProductsOverviewModalOpen] = useState(false);
  const [isCategoriesOverviewModalOpen, setIsCategoriesOverviewModalOpen] = useState(false);
  
  // Datos del dashboard
  const [dashboardStats, setDashboardStats] = useState({
    pedidosHoy: [],
    totalOrders: 0,
    allOrders: [],
    totalUsers: 0,
    recentUsers: [],
    allUsersSorted: [],
    productsStats: {
      total: 0,
      onSale: 0,
      featured: 0
    },
    categoriesStats: {
      total: 0,
      categories: []
    },
    products: []
  });

  // Opciones del menú lateral
  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Panel Principal', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      badge: null
    },
    { 
      id: 'products', 
      name: 'Productos', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      badge: null
    },
    { 
      id: 'categories', 
      name: 'Categorías', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      badge: null
    },
    { 
      id: 'orders', 
      name: 'Pedidos', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      badge: newOrdersCount > 0 ? newOrdersCount : null
    },
    { 
      id: 'users', 
      name: 'Usuarios', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      badge: newUsersCount > 0 ? newUsersCount : null
    },
    { 
      id: 'inventory', 
      name: 'Inventario', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      badge: null
    },
    { 
      id: 'store', 
      name: 'Configuración Tienda', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badge: null
    },
  ];

  // Cargar perfil del usuario y datos del dashboard
  const fetchProfileData = async () => {
    try {
      // Obtener el perfil primero
      const response = await authService.getProfile({ silentError: true });
      
      // Según API_DOCUMENTATION.md, la respuesta es { success: true, data: { user: {...} } }
      const userProfile = response.data?.user || response.data || {};
      setProfileData(userProfile);

      // Si el perfil tiene local, actualizarlo en localStorage y Redux
      if (userProfile?.local) {
        const updatedUser = {
          ...user,
          local: userProfile.local
        };
        
        // Actualizar localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        await loadDashboardData(userProfile.local);
      } else {
        console.warn('El perfil no incluye información del local');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      toast.error('Error al cargar el perfil');
      setLoading(false);
    }
  };

  // Cargar datos del dashboard con el local proporcionado
  const loadDashboardData = async (local) => {
    try {
      setLoading(true);
      
      
      // El backend puede devolver el local como string (ID) o como objeto completo
      let localData;
      let localId;
      let slug;
      
      if (typeof local === 'string') {
        // Si es un string, es el ID del local - necesitamos obtener el objeto completo
        localId = local;
        
        try {
          const localResponse = await localService.getLocalById(localId);
          localData = localResponse; // El objeto local completo
          slug = localData.slug || localData.nombre?.toLowerCase().replace(/\s+/g, '-') || 'default';
          
          // Actualizar localStorage con el local completo
          const updatedUser = {
            ...user,
            local: localData
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setProfileData(prev => ({ ...prev, local: localData }));
        } catch (error) {
          console.error('❌ Error al obtener el local completo:', error);
          toast.error('Error al cargar información del local');
          setLoading(false);
          return;
        }
      } else if (local && typeof local === 'object') {
        // Si es un objeto, extraer el ID y slug directamente
        localData = local;
        localId = local._id;
        slug = local.slug || local.nombre?.toLowerCase().replace(/\s+/g, '-') || 'default';
      } else {
        console.error('❌ Local no válido:', local);
        setLoading(false);
        return;
      }
      
      if (!localId) {
        console.error('No se pudo obtener el ID del local');
        setLoading(false);
        return;
      }

      // Actualizar el slug de la tienda y sincronizar Redux + localStorage
      setStoreSlug(slug);
      localStorage.setItem('store_slug', slug);
      dispatch(updateUserLocal(localData));

      // Obtener todas las estadísticas
      const [allOrders, allUsers, allProductsResponse, allCategories] = await Promise.all([
        orderService.getAdminOrdersV2().catch(() => []),
        userService.getAllUsers().catch(() => []),
        productService.getProductsByLocal(localId).catch(() => ({ productos: [] })),
        categoryService.getCategoriesByLocal(localId).catch(() => [])
      ]);
      
      // Extraer el array de productos de la respuesta
      const allProducts = allProductsResponse?.productos || [];

      // Procesar órdenes
      const today = new Date();
      const pedidosHoy = Array.isArray(allOrders)
        ? allOrders.filter(order => {
            const createdAt = new Date(order.createdAt);
            return createdAt.toDateString() === today.toDateString();
          })
        : [];

      // Procesar usuarios recientes
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      const recentUsers = Array.isArray(allUsers)
        ? allUsers.filter(user => {
            const createdAt = new Date(user.createdAt);
            return createdAt >= sevenDaysAgo;
          })
        : [];

      // Calcular nuevos registros desde última visita
      if (lastVisitedAt) {
        const newUsers = recentUsers.filter(user => new Date(user.createdAt) > new Date(lastVisitedAt));
        const newOrders = pedidosHoy.filter(order => new Date(order.createdAt) > new Date(lastVisitedAt));
        setNewUsersCount(newUsers.length);
        setNewOrdersCount(newOrders.length);
      }

      // Actualizar estado
      setDashboardStats({
        pedidosHoy,
        totalOrders: allOrders?.length || 0,
        allOrders: allOrders || [],
        totalUsers: allUsers?.length || 0,
        recentUsers,
        allUsersSorted: (allUsers || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        productsStats: {
          total: allProducts?.length || 0,
          onSale: allProducts?.filter(p => p.onSale)?.length || 0,
          featured: allProducts?.filter(p => p.featured)?.length || 0
        },
        categoriesStats: {
          total: allCategories?.length || 0,
          categories: allCategories || []
        },
        products: allProducts || []
      });

      setLoading(false);
      
      // Mostrar notificación de bienvenida
      if (!lastVisitedAt) {
        toast.success('¡Bienvenido al panel de administración!', { icon: '👋' });
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('Error al cargar los datos del dashboard');
      setLoading(false);
    }
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    dispatch(logout());
    toast.info('Sesión cerrada correctamente');
    navigate('/login');
  };

  // Efectos — depende solo del token para no re-dispararse cuando se actualiza user.local
  const userToken = user?.token;
  useEffect(() => {
    if (!userToken || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    const lastVisit = localStorage.getItem('admin_last_visited');
    if (lastVisit) setLastVisitedAt(new Date(lastVisit));
    localStorage.setItem('admin_last_visited', new Date().toISOString());
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToken]);

  // Renderizar contenido según el menú activo
  const renderContent = () => {
    if (loading && activeMenuItem === 'dashboard') {
      return <LoadingSpinner fullScreen text="Cargando datos del dashboard..." />;
    }

    // Si no hay storeSlug y no es dashboard, mostrar loading
    if (!storeSlug && activeMenuItem !== 'dashboard') {
      return <LoadingSpinner fullScreen text="Cargando información de la tienda..." />;
    }

    switch (activeMenuItem) {
      case 'dashboard':
        return (
          <DashboardStats
            stats={dashboardStats}
            onOpenPendingOrders={() => setIsPendingOrdersModalOpen(true)}
            onOpenRecentUsers={() => setIsRecentUsersModalOpen(true)}
            onOpenProductsOverview={() => setIsProductsOverviewModalOpen(true)}
            onOpenCategoriesOverview={() => setIsCategoriesOverviewModalOpen(true)}
          />
        );
      case 'products':
        return <ProductsManagement storeSlug={storeSlug} key={storeSlug} />;
      case 'categories':
        return <CategoriesManagement storeSlug={storeSlug} key={storeSlug} />;
      case 'orders':
        return <OrdersManagement storeSlug={storeSlug} key={storeSlug} />;
      case 'users':
        return <UsersManagement storeSlug={storeSlug} key={storeSlug} />;
      case 'inventory':
        return <InventoryDashboard storeSlug={storeSlug} key={storeSlug} />;
      case 'store':
        return <StoreSettingsPage storeSlug={storeSlug} key={storeSlug} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col premium-card border-r border-white/10 rounded-none">
          {/* Header del sidebar */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-glow-primary flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">{profileData?.local?.nombre || 'Mi Tienda'}</h2>
                <p className="text-xs text-gray-400">Panel de Administración</p>
              </div>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'Administrador'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-custom">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenuItem(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                  transition-all duration-300 font-medium
                  ${activeMenuItem === item.id
                    ? 'text-white bg-gradient-to-r from-primary-600/20 to-primary-500/20 border-l-4 border-primary-400 shadow-glow-primary'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="badge badge-error animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Botón de cerrar sesión */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                       text-error-300 hover:text-white hover:bg-error-500/20 
                       border border-error-400/30 hover:border-error-400/50
                       transition-all duration-300 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        {/* Header móvil */}
        <div className="lg:hidden sticky top-0 z-30 glass-card border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-white">
              {menuItems.find(item => item.id === activeMenuItem)?.name}
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      {/* Modales */}
      <PendingOrdersModal
        isOpen={isPendingOrdersModalOpen}
        onClose={() => setIsPendingOrdersModalOpen(false)}
        orders={dashboardStats.pedidosHoy}
      />
      <RecentUsersModal
        isOpen={isRecentUsersModalOpen}
        onClose={() => setIsRecentUsersModalOpen(false)}
        users={dashboardStats.recentUsers}
      />
      <ProductsOverviewModal
        isOpen={isProductsOverviewModalOpen}
        onClose={() => setIsProductsOverviewModalOpen(false)}
        products={dashboardStats.products}
      />
      <CategoriesOverviewModal
        isOpen={isCategoriesOverviewModalOpen}
        onClose={() => setIsCategoriesOverviewModalOpen(false)}
        categories={dashboardStats.categoriesStats.categories}
      />
    </div>
  );
};

export default AdminDashboard;
