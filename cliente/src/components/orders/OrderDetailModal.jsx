import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import StatusBadge from '../common/StatusBadge';

const OrderDetailModal = ({ isOpen, onClose, order, onUpdateStatus, onUpdatePayment }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusData, setStatusData] = useState({ estado: '', notas: '' });
  const [paymentData, setPaymentData] = useState({ estadoPago: '', idTransaccion: '', notas: '' });

  useEffect(() => {
    if (order) {
      setStatusData({ estado: order.estadoPedido || 'pendiente', notas: '' });
      setPaymentData({
        estadoPago: order.estadoPago || 'pendiente',
        idTransaccion: order.datosTransaccion?.idTransaccion || '',
        notas: ''
      });
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const formatDate = (dateString) => new Date(dateString).toLocaleString();
  const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(price);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusData.estado) return;
    
    try {
      setIsUpdating(true);
      await onUpdateStatus(order._id, statusData);
      setStatusData({ ...statusData, notas: '' });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (!paymentData.estadoPago) return;

    try {
      setIsUpdating(true);
      await onUpdatePayment(order._id, paymentData);
      setPaymentData({ ...paymentData, notas: '' });
    } catch (error) {
      console.error('Error al actualizar pago:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-6xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/20">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Detalles del Pedido</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto scrollbar-custom space-y-6">
          {/* Info Cliente y Pedido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <h4 className="font-semibold text-lg text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Cliente
              </h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-gray-400">Nombre:</span> {order.usuario?.name || order.direccionEnvio?.nombre || 'N/A'}</p>
                <p><span className="text-gray-400">Email:</span> {order.usuario?.email || 'N/A'}</p>
                <p><span className="text-gray-400">Teléfono:</span> {order.direccionEnvio?.telefono || 'N/A'}</p>
                <p><span className="text-gray-400">Dirección:</span> {order.direccionEnvio?.direccion || 'N/A'}</p>
                <p><span className="text-gray-400">Ciudad:</span> {order.direccionEnvio?.ciudad || 'N/A'}</p>
                <p><span className="text-gray-400">País:</span> {order.direccionEnvio?.pais || 'N/A'}</p>
                {order.direccionEnvio?.codigoPostal && (
                  <p><span className="text-gray-400">CP:</span> {order.direccionEnvio.codigoPostal}</p>
                )}
              </div>
            </div>
            
            <div className="glass-card p-4">
              <h4 className="font-semibold text-lg text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pedido
              </h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-gray-400">ID:</span> <span className="font-mono text-xs">{order._id}</span></p>
                <p><span className="text-gray-400">Fecha:</span> {formatDate(order.createdAt)}</p>
                <p><span className="text-gray-400">Tienda:</span> {order.local?.nombre}</p>
                <p className="flex items-center gap-2">
                  <span className="text-gray-400">Estado:</span>
                  <StatusBadge status={order.estadoPedido} type="order" />
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-gray-400">Pago:</span>
                  <StatusBadge status={order.estadoPago} type="payment" />
                </p>
                <p><span className="text-gray-400">Método:</span> {order.metodoPago || 'N/A'}</p>
                {order.datosTransaccion?.idTransaccion && (
                  <p><span className="text-gray-400">Transacción:</span> <span className="font-mono text-xs">{order.datosTransaccion.idTransaccion}</span></p>
                )}
                {order.fechaEntrega && (
                  <p><span className="text-gray-400">Fecha Entrega:</span> {formatDate(order.fechaEntrega)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Resumen Costos */}
          <div className="glass-card p-4">
            <h4 className="font-semibold text-lg text-white mb-3">Resumen de Costos</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300"><span>Subtotal:</span><span>{formatPrice(order.subtotal || 0)}</span></div>
              <div className="flex justify-between text-gray-300"><span>Impuestos:</span><span>{formatPrice(order.impuestos || 0)}</span></div>
              <div className="flex justify-between text-gray-300"><span>Envío:</span><span>{formatPrice(order.costoEnvio || 0)}</span></div>
              {order.descuento > 0 && <div className="flex justify-between text-success-400"><span>Descuento:</span><span>-{formatPrice(order.descuento)}</span></div>}
              <div className="flex justify-between font-bold text-lg text-white pt-2 border-t border-white/10">
                <span>Total:</span><span>{formatPrice(order.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="glass-card p-4">
            <h4 className="font-semibold text-lg text-white mb-3">Productos</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-gray-400 font-medium">Producto</th>
                    <th className="text-center py-2 text-gray-400 font-medium">Cant.</th>
                    <th className="text-right py-2 text-gray-400 font-medium">Precio</th>
                    <th className="text-right py-2 text-gray-400 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {order.productos?.length > 0 ? order.productos.map((item, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {item.producto.imagenes?.[0]?.url && (
                            <img src={item.producto.imagenes[0].url} alt={item.producto.nombre} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <span>{item.producto.nombre}</span>
                        </div>
                      </td>
                      <td className="text-center py-3">{item.cantidad}</td>
                      <td className="text-right py-3">{formatPrice(item.precio)}</td>
                      <td className="text-right py-3 font-medium">{formatPrice(item.subtotal)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-4 text-gray-400">No hay productos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historial de Estados */}
          {order.historialEstados && order.historialEstados.length > 0 && (
            <div className="glass-card p-4">
              <h4 className="font-semibold text-lg text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Historial de Estados
              </h4>
              <div className="space-y-3">
                {order.historialEstados.map((historial, index) => (
                  <div key={index} className="border-l-4 border-primary-400 pl-4 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white capitalize">{historial.estado}</span>
                      <span className="text-xs text-gray-400">{formatDate(historial.fecha)}</span>
                    </div>
                    {historial.usuario && (
                      <p className="text-sm text-gray-400">Por: {historial.usuario.name || historial.usuario.email}</p>
                    )}
                    {historial.notas && (
                      <p className="text-sm text-gray-300 mt-1">{historial.notas}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial de Pagos */}
          {order.historialPagos && order.historialPagos.length > 0 && (
            <div className="glass-card p-4">
              <h4 className="font-semibold text-lg text-white mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Historial de Pagos
              </h4>
              <div className="space-y-3">
                {order.historialPagos.map((historial, index) => (
                  <div key={index} className="border-l-4 border-success-400 pl-4 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white capitalize">{historial.estado}</span>
                      <span className="text-xs text-gray-400">{formatDate(historial.fecha)}</span>
                    </div>
                    {historial.monto && (
                      <p className="text-sm text-gray-300">Monto: {formatPrice(historial.monto)}</p>
                    )}
                    {historial.idTransaccion && (
                      <p className="text-sm text-gray-400 font-mono text-xs">ID: {historial.idTransaccion}</p>
                    )}
                    {historial.notas && (
                      <p className="text-sm text-gray-300 mt-1">{historial.notas}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actualizar Estado y Pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <h4 className="font-semibold text-lg text-white mb-3">Actualizar Estado</h4>
              <form onSubmit={handleUpdateStatus} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                  <select value={statusData.estado} onChange={(e) => setStatusData({ ...statusData, estado: e.target.value })} className="input-modern" required>
                    <option value="">Seleccionar</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="procesando">Procesando</option>
                    <option value="enviado">Enviado</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notas</label>
                  <textarea value={statusData.notas} onChange={(e) => setStatusData({ ...statusData, notas: e.target.value })} rows="2" className="input-modern resize-none" />
                </div>
                <button type="submit" disabled={isUpdating} className="btn-primary w-full">
                  {isUpdating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Actualizando...</span></> : 'Actualizar Estado'}
                </button>
              </form>
            </div>
            
            <div className="glass-card p-4">
              <h4 className="font-semibold text-lg text-white mb-3">Actualizar Pago</h4>
              <form onSubmit={handleUpdatePayment} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Estado de Pago</label>
                  <select value={paymentData.estadoPago} onChange={(e) => setPaymentData({ ...paymentData, estadoPago: e.target.value })} className="input-modern" required>
                    <option value="">Seleccionar</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="procesando">Procesando</option>
                    <option value="completado">Completado</option>
                    <option value="fallido">Fallido</option>
                    <option value="reembolsado">Reembolsado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ID Transacción</label>
                  <input type="text" value={paymentData.idTransaccion} onChange={(e) => setPaymentData({ ...paymentData, idTransaccion: e.target.value })} className="input-modern" />
                </div>
                <button type="submit" disabled={isUpdating} className="btn-primary w-full">
                  {isUpdating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Actualizando...</span></> : 'Actualizar Pago'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

OrderDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  onUpdateStatus: PropTypes.func.isRequired,
  onUpdatePayment: PropTypes.func.isRequired,
};

export default OrderDetailModal;
