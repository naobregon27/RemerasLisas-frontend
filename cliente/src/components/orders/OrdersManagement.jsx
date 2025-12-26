import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';
import OrderTable from './OrderTable';
import OrderDetailModal from './OrderDetailModal';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

const OrdersManagement = () => {
  const { user, profileData } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [lastVisitedAt, setLastVisitedAt] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
    const lastVisit = localStorage.getItem('admin_last_visited');
    if (lastVisit) {
      setLastVisitedAt(lastVisit);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getAdminOrders();
      const ordersList = Array.isArray(response) ? response : response.pedidos || [];
      setOrders(ordersList);
      toast.success(`${ordersList.length} pedidos cargados`, { icon: '📦' });
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('No se pudieron cargar los pedidos. Por favor, intente nuevamente.');
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      setLoading(true);
      const orderDetails = await orderService.getOrderById(orderId);
      setSelectedOrder(orderDetails);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error);
      toast.error('No se pudieron cargar los detalles del pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, statusData) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, statusData);
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, estadoPedido: statusData.estado } : order
      ));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, estadoPedido: statusData.estado });
      }
      
      toast.success(`Estado actualizado: ${statusData.estado}`, { icon: '✅' });
      return updatedOrder;
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      toast.error('No se pudo actualizar el estado del pedido');
      throw error;
    }
  };

  const handleUpdatePaymentStatus = async (orderId, paymentData) => {
    try {
      const updatedOrder = await orderService.updatePaymentStatus(orderId, paymentData);
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, estadoPago: paymentData.estadoPago } : order
      ));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, estadoPago: paymentData.estadoPago });
      }
      
      toast.success(`Estado de pago: ${paymentData.estadoPago}`, { icon: '💳' });
      return updatedOrder;
    } catch (error) {
      console.error('Error al actualizar estado de pago:', error);
      toast.error('No se pudo actualizar el estado de pago');
      throw error;
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      return;
    }

    try {
      await orderService.deleteOrder(orderId);
      setOrders(prev => prev.filter(order => order._id !== orderId));
      toast.success('Pedido eliminado exitosamente', { icon: '🗑️' });
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      toast.error('No se pudo eliminar el pedido');
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filterStatus || order.estadoPedido === filterStatus;
    const matchesSearch = !searchTerm || 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Estadísticas rápidas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.estadoPedido === 'pendiente').length,
    processing: orders.filter(o => o.estadoPedido === 'en_proceso').length,
    completed: orders.filter(o => o.estadoPedido === 'completado').length,
    cancelled: orders.filter(o => o.estadoPedido === 'cancelado').length,
  };

  if (loading && orders.length === 0) {
    return <LoadingSpinner fullScreen text="Cargando pedidos..." />;
  }

  if (error) {
    return <ErrorState title="Error" message={error} onRetry={fetchOrders} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-title">Gestión de Pedidos</h1>
            <p className="text-gray-400 mt-1">
              {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-warning-400">
          <p className="text-xs text-gray-400 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-warning-400">{stats.pending}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-accent-400">
          <p className="text-xs text-gray-400 mb-1">En Proceso</p>
          <p className="text-2xl font-bold text-accent-400">{stats.processing}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-success-400">
          <p className="text-xs text-gray-400 mb-1">Completados</p>
          <p className="text-2xl font-bold text-success-400">{stats.completed}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-error-400">
          <p className="text-xs text-gray-400 mb-1">Cancelados</p>
          <p className="text-2xl font-bold text-error-400">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar pedidos
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
                placeholder="Buscar por ID, cliente..."
                className="input-modern pl-10"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filtrar por estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select-modern"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No hay pedidos"
          description={searchTerm || filterStatus ? 
            "No se encontraron pedidos con los filtros aplicados" : 
            "Aún no hay pedidos registrados"}
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <OrderTable
            orders={filteredOrders}
            onView={handleViewOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdatePayment={handleUpdatePaymentStatus}
            onDelete={handleDeleteOrder}
            lastVisitedAt={lastVisitedAt}
          />
        </div>
      )}

      {/* Modal de detalles */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
        onUpdateStatus={handleUpdateOrderStatus}
        onUpdatePayment={handleUpdatePaymentStatus}
      />
    </div>
  );
};

export default OrdersManagement;
