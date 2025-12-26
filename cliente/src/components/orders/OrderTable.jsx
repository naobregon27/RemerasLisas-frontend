import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Pagination from '../shared/Pagination';

const OrderTable = ({ orders, onViewOrder, lastVisitedAt }) => {
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

  // Función para obtener la clase de color según el estado del pedido
  const getStatusClass = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'procesando':
        return 'bg-blue-100 text-blue-800';
      case 'enviado':
        return 'bg-purple-100 text-purple-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener la clase de color según el estado de pago
  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'fallido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Verificar si un pedido es nuevo (creado después de la última visita)
  const isNewOrder = (order) => {
    if (!lastVisitedAt || !order.createdAt) return false;
    return new Date(order.createdAt) > new Date(lastVisitedAt);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
        No hay pedidos disponibles.
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {/* Buscador */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por nombre, dirección, ciudad, país, teléfono o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg 
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
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

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dirección
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ciudad
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teléfono
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedOrders.map((order) => {
            const isNew = isNewOrder(order);
            return (
              <tr 
                key={order._id} 
                className={`hover:bg-gray-50 cursor-pointer ${isNew ? 'bg-blue-50' : ''}`}
                onClick={() => onViewOrder(order._id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {isNew && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white mr-2">
                        Nuevo
                      </span>
                    )}
                    <div className="text-sm font-medium text-gray-900">{order.direccionEnvio?.nombre || 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.direccionEnvio?.direccion || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.direccionEnvio?.ciudad || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{order.direccionEnvio?.pais || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.direccionEnvio?.telefono || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.estadoPedido)}`}>
                    {order.estadoPedido || 'Desconocido'}
                  </span>
                  <div className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusClass(order.estadoPago)}`}>
                      {order.estadoPago || 'Desconocido'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewOrder(order._id);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 p-2 rounded-full"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}

          {paginatedOrders.length === 0 && (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                {searchTerm ? 'No se encontraron pedidos con ese término de búsqueda.' : 'No hay pedidos disponibles en esta página.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Componente de paginación */}
      <div className="bg-white px-4 py-3 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <div className="text-sm text-gray-500 mt-2 text-center">
          Mostrando {paginatedOrders.length} de {filteredOrders.length} pedidos
        </div>
      </div>
    </div>
  );
};

OrderTable.propTypes = {
  orders: PropTypes.array.isRequired,
  onViewOrder: PropTypes.func.isRequired,
  lastVisitedAt: PropTypes.string
};

export default OrderTable; 