import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

const DashboardStats = ({ 
  stats, 
  loading, 
  onOpenPendingOrders, 
  onOpenRecentUsers, 
  onOpenProductsOverview, 
  onOpenCategoriesOverview 
}) => {
  if (loading) {
    return <LoadingSpinner size="lg" text="Cargando estadísticas..." />;
  }

  // Calcular pedidos pendientes
  const pendingOrders = stats?.allOrders?.filter(order => order.status === 'pending') || [];

  // Tarjetas de estadísticas
  const statCards = [
    {
      title: 'Pedidos Hoy',
      value: stats?.pedidosHoy?.length || 0,
      subtitle: `Total: ${stats?.totalOrders || 0} pedidos`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'from-accent-600 to-accent-500',
      bgColor: 'bg-accent-500/10',
      borderColor: 'border-accent-400/30',
      onClick: onOpenPendingOrders,
      badge: pendingOrders.length > 0 ? `${pendingOrders.length} pendientes` : null,
      badgeColor: 'badge-warning'
    },
    {
      title: 'Usuarios Totales',
      value: stats?.totalUsers || 0,
      subtitle: `Nuevos (7 días): ${stats?.recentUsers?.length || 0}`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-success-600 to-success-500',
      bgColor: 'bg-success-500/10',
      borderColor: 'border-success-400/30',
      onClick: onOpenRecentUsers,
      badge: stats?.recentUsers?.length > 0 ? `${stats.recentUsers.length} nuevos` : null,
      badgeColor: 'badge-success'
    },
    {
      title: 'Productos',
      value: stats?.productsStats?.total || 0,
      subtitle: `${stats?.productsStats?.onSale || 0} en oferta • ${stats?.productsStats?.featured || 0} destacados`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-primary-600 to-primary-500',
      bgColor: 'bg-primary-500/10',
      borderColor: 'border-primary-400/30',
      onClick: onOpenProductsOverview,
    },
    {
      title: 'Categorías',
      value: stats?.categoriesStats?.total || 0,
      subtitle: 'Categorías activas',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'from-warning-600 to-warning-500',
      bgColor: 'bg-warning-500/10',
      borderColor: 'border-warning-400/30',
      onClick: onOpenCategoriesOverview,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-title">Panel Principal</h1>
            <p className="text-gray-400 mt-1">Vista general de tu tienda</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className="glass-card p-6 cursor-pointer group hover:scale-105 transition-transform duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor} border ${card.borderColor} group-hover:shadow-glow-primary transition-shadow`}>
                <div className="text-white">
                  {card.icon}
                </div>
              </div>
              {card.badge && (
                <span className={`badge ${card.badgeColor} animate-pulse`}>
                  {card.badge}
                </span>
              )}
            </div>

            <h3 className="text-sm font-medium text-gray-400 mb-1">{card.title}</h3>
            <p className="text-4xl font-bold text-white mb-2">{card.value}</p>
            <p className="text-xs text-gray-400">{card.subtitle}</p>

            {/* Indicador de ver más */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-primary-400 group-hover:text-primary-300 transition-colors">Ver detalles</span>
              <svg className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas importantes */}
      {(pendingOrders.length > 0 || (stats?.recentUsers?.length || 0) > 0) && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 className="text-xl font-bold text-white">Notificaciones Importantes</h2>
          </div>

          <div className="space-y-3">
            {pendingOrders.length > 0 && (
              <div 
                onClick={onOpenPendingOrders}
                className="flex items-start gap-4 p-4 rounded-xl bg-warning-500/10 border border-warning-400/30 hover:bg-warning-500/20 transition-colors cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-warning-500/20">
                  <svg className="w-5 h-5 text-warning-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-warning-300 mb-1">
                    {pendingOrders.length} Pedido{pendingOrders.length !== 1 ? 's' : ''} Pendiente{pendingOrders.length !== 1 ? 's' : ''}
                  </h4>
                  <p className="text-sm text-gray-400">Requieren tu atención inmediata</p>
                </div>
                <svg className="w-5 h-5 text-warning-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}

            {(stats?.recentUsers?.length || 0) > 0 && (
              <div 
                onClick={onOpenRecentUsers}
                className="flex items-start gap-4 p-4 rounded-xl bg-success-500/10 border border-success-400/30 hover:bg-success-500/20 transition-colors cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-success-500/20">
                  <svg className="w-5 h-5 text-success-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-success-300 mb-1">
                    {stats.recentUsers.length} Nuevo{stats.recentUsers.length !== 1 ? 's' : ''} Usuario{stats.recentUsers.length !== 1 ? 's' : ''}
                  </h4>
                  <p className="text-sm text-gray-400">Registrados en los últimos 7 días</p>
                </div>
                <svg className="w-5 h-5 text-success-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actividad reciente */}
      {stats?.pedidosHoy && stats.pedidosHoy.length > 0 ? (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Actividad de Hoy
          </h2>

          <div className="space-y-3">
            {stats.pedidosHoy.slice(0, 5).map((order, index) => (
              <div 
                key={order._id || index}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">Pedido #{order._id?.slice(-6)}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-400">${order.total?.toFixed(2) || '0.00'}</p>
                  <span className={`badge ${order.status === 'pending' ? 'badge-warning' : order.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {stats.pedidosHoy.length > 5 && (
            <button
              onClick={onOpenPendingOrders}
              className="w-full mt-4 btn-secondary"
            >
              Ver todos los pedidos de hoy ({stats.pedidosHoy.length})
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card p-6">
          <EmptyState
            icon="📦"
            title="No hay pedidos hoy"
            description="Aún no se han realizado pedidos el día de hoy"
          />
        </div>
      )}

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary-500/20">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Estado del Sistema</h3>
          </div>
          <p className="text-sm text-gray-400 mb-2">Todos los sistemas funcionando correctamente</p>
          <div className="flex items-center gap-2 text-success-400">
            <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse"></div>
            <span className="text-sm font-medium">Operativo</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent-500/20">
              <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Rendimiento</h3>
          </div>
          <p className="text-sm text-gray-400 mb-2">Tu tienda está creciendo</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span className="text-sm font-medium text-accent-400">75%</span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-warning-500/20">
              <svg className="w-5 h-5 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white">Acciones Pendientes</h3>
          </div>
          <p className="text-sm text-gray-400 mb-2">Tareas que requieren atención</p>
          <span className="text-2xl font-bold text-white">{pendingOrders.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
