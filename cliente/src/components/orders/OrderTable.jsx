import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Pagination from '../shared/Pagination';

const OrderTable = ({ orders, onViewOrder, onUpdateStatus, onUpdatePayment, onDelete, lastVisitedAt }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedOrders, setPaginatedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const itemsPerPage = 10;

  // Aplicar filtros cuando cambien los pedidos o el término de búsqueda
  useEffect(() => {
    const filtered = orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (order.direccionEnvio?.nombre || '').toLowerCase().includes(searchLower) ||
        (order.direccionEnvio?.direccion || '').toLowerCase().includes(searchLower) ||
        (order.direccionEnvio?.ciudad || '').toLowerCase().includes(searchLower) ||
        (order.direccionEnvio?.pais || '').toLowerCase().includes(searchLower) ||
        (order.direccionEnvio?.telefono || '').toLowerCase().includes(searchLower) ||
        (order.estadoPedido || '').toLowerCase().includes(searchLower)
      );
    });
    setFilteredOrders(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando se filtra
  }, [orders, searchTerm]);

  // Paginar los pedidos filtrados
  useEffect(() => {
    paginate(currentPage);
  }, [filteredOrders, currentPage]);

  const paginate = (pageNumber) => {
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedOrders(filteredOrders.slice(startIndex, endIndex));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Cálculo del número total de páginas
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Función para obtener la clase de color según el estado del pedido (dark theme)
  const getStatusClass = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-warning-500/20 text-warning-300 border border-warning-400/30';
      case 'procesando':
        return 'bg-accent-500/20 text-accent-300 border border-accent-400/30';
      case 'enviado':
        return 'bg-primary-500/20 text-primary-300 border border-primary-400/30';
      case 'entregado':
        return 'bg-success-500/20 text-success-300 border border-success-400/30';
      case 'cancelado':
        return 'bg-error-500/20 text-error-300 border border-error-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-400/30';
    }
  };

  // Función para formatear el estado para mostrar
  const formatStatus = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente',
      'procesando': 'Procesando',
      'enviado': 'Enviado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // Función para formatear el estado de pago para mostrar
  const formatPaymentStatus = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente',
      'procesando': 'Procesando',
      'completado': 'Completado',
      'fallido': 'Fallido',
      'reembolsado': 'Reembolsado'
    };
    return statusMap[status] || status;
  };

  // Función para obtener la clase de color según el estado de pago (dark theme)
  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-warning-500/20 text-warning-300 border border-warning-400/30';
      case 'procesando':
        return 'bg-accent-500/20 text-accent-300 border border-accent-400/30';
      case 'completado':
        return 'bg-success-500/20 text-success-300 border border-success-400/30';
      case 'fallido':
        return 'bg-error-500/20 text-error-300 border border-error-400/30';
      case 'reembolsado':
        return 'bg-error-500/20 text-error-300 border border-error-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-400/30';
    }
  };

  // Verificar si un pedido es nuevo (creado después de la última visita)
  const isNewOrder = (order) => {
    if (!lastVisitedAt || !order.createdAt) return false;
    return new Date(order.createdAt) > new Date(lastVisitedAt);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-gray-400">
        No hay pedidos disponibles.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Buscador - Solo visible en móviles si es necesario */}
      <div className="p-4 border-b border-white/10 md:hidden">
        <div className="relative">
          <input
            type="text"
            className="input-modern pl-10"
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>

      {/* Tabla Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Cliente
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Dirección
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ciudad
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Teléfono
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {paginatedOrders.map((order) => {
              const isNew = isNewOrder(order);
              return (
                <tr 
                  key={order._id} 
                  className={`hover:bg-white/5 cursor-pointer transition-colors ${isNew ? 'bg-primary-500/10 border-l-4 border-primary-400' : ''}`}
                  onClick={() => onViewOrder(order._id)}
                >
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isNew && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error-500 text-xs font-medium text-white mr-2">
                          !
                        </span>
                      )}
                      <div className="text-sm font-medium text-white">{order.direccionEnvio?.nombre || order.usuario?.name || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{order.direccionEnvio?.direccion || 'N/A'}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{order.direccionEnvio?.ciudad || 'N/A'}</div>
                    <div className="text-xs text-gray-400">{order.direccionEnvio?.pais || 'N/A'}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{order.direccionEnvio?.telefono || 'N/A'}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.estadoPedido)}`}>
                      {formatStatus(order.estadoPedido) || 'Desconocido'}
                    </span>
                    <div className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusClass(order.estadoPago)}`}>
                        {formatPaymentStatus(order.estadoPago) || 'Desconocido'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewOrder(order._id);
                        }}
                        className="p-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 hover:text-primary-200 border border-primary-400/30 hover:border-primary-400/50 transition-all"
                        title="Ver detalles"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
                              onDelete(order._id);
                            }
                          }}
                          className="p-2 rounded-lg bg-error-500/20 hover:bg-error-500/30 text-error-300 hover:text-error-200 border border-error-400/30 hover:border-error-400/50 transition-all"
                          title="Eliminar pedido"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-400">
                  {searchTerm ? 'No se encontraron pedidos con ese término de búsqueda.' : 'No hay pedidos disponibles en esta página.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil - Cards */}
      <div className="md:hidden space-y-4 p-4">
        {paginatedOrders.map((order) => {
          const isNew = isNewOrder(order);
          return (
            <div
              key={order._id}
              className={`glass-card p-4 cursor-pointer hover:border-primary-400/50 transition-all ${isNew ? 'border-l-4 border-primary-400' : ''}`}
              onClick={() => onViewOrder(order._id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isNew && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error-500 text-xs font-medium text-white">
                        !
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-white">{order.direccionEnvio?.nombre || order.usuario?.name || 'N/A'}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{order.direccionEnvio?.direccion || 'N/A'}</p>
                  <p className="text-xs text-gray-400">{order.direccionEnvio?.ciudad || 'N/A'}, {order.direccionEnvio?.pais || 'N/A'}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOrder(order._id);
                    }}
                    className="p-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 border border-primary-400/30 transition-all"
                    title="Ver detalles"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
                          onDelete(order._id);
                        }
                      }}
                      className="p-2 rounded-lg bg-error-500/20 hover:bg-error-500/30 text-error-300 border border-error-400/30 transition-all"
                      title="Eliminar pedido"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.estadoPedido)}`}>
                  {formatStatus(order.estadoPedido) || 'Desconocido'}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(order.estadoPago)}`}>
                  {formatPaymentStatus(order.estadoPago) || 'Desconocido'}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(order.createdAt).toLocaleDateString('es-AR')}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                <span className="text-gray-500">Tel:</span> {order.direccionEnvio?.telefono || 'N/A'}
              </div>
            </div>
          );
        })}
        {paginatedOrders.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            {searchTerm ? 'No se encontraron pedidos con ese término de búsqueda.' : 'No hay pedidos disponibles en esta página.'}
          </div>
        )}
      </div>
      
      {/* Componente de paginación */}
      <div className="glass-card border-t border-white/10 px-4 py-3">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <div className="text-sm text-gray-400 mt-2 text-center">
          Mostrando {paginatedOrders.length} de {filteredOrders.length} pedidos
        </div>
      </div>
    </div>
  );
};

OrderTable.propTypes = {
  orders: PropTypes.array.isRequired,
  onViewOrder: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func,
  onUpdatePayment: PropTypes.func,
  onDelete: PropTypes.func,
  lastVisitedAt: PropTypes.string
};

export default OrderTable; 