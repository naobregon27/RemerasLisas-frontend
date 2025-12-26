import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

const PendingOrdersModal = ({ isOpen, onClose, orders }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent-500/20">
              <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Pedidos de Hoy</h2>
              <p className="text-sm text-gray-400">{orders?.length || 0} pedidos encontrados</p>
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
        <div className="space-y-4">
          {!orders || orders.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No hay pedidos de hoy"
              description="Aún no se han realizado pedidos el día de hoy"
            />
          ) : (
            orders.map((order, index) => (
              <div 
                key={order._id} 
                className="glass-card p-5 hover:border-primary-400/50 transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        Pedido #{order._id?.slice(-8) || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {order.usuario?.nombre || order.usuario?.email || 'Cliente'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-400 mb-1">
                      ${order.total?.toFixed(2) || '0.00'}
                    </p>
                    <StatusBadge status={order.estado || order.status || 'pending'} />
                  </div>
                </div>

                {/* Detalles del pedido */}
                <div className="border-t border-white/10 pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Fecha y hora</p>
                      <p className="text-sm text-white font-medium">
                        {new Date(order.createdAt || order.fechaCreacion).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Método de pago</p>
                      <p className="text-sm text-white font-medium">
                        {order.metodoPago || order.paymentMethod || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  {/* Productos */}
                  {order.productos && order.productos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Productos ({order.productos.length})
                      </h4>
                      <div className="space-y-2">
                        {order.productos.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="flex justify-between items-center p-2 rounded-lg bg-white/5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-primary-400">
                                {item.cantidad}x
                              </span>
                              <span className="text-sm text-gray-300">
                                {item.producto?.nombre || item.name || 'Producto'}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-white">
                              ${((item.precio || item.price || 0) * item.cantidad).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

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

export default PendingOrdersModal;
