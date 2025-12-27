import PropTypes from 'prop-types';

const StatusBadge = ({ status, type = 'default', className = '' }) => {
  const typeClasses = {
    default: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  };

  // Si el tipo es 'order' o 'payment', mapear automáticamente los colores
  const getTypeForStatus = (statusValue, statusType) => {
    if (statusType === 'order') {
      if (['pendiente', 'pending'].includes(statusValue)) return 'warning';
      if (['procesando', 'processing'].includes(statusValue)) return 'info';
      if (['enviado', 'shipped'].includes(statusValue)) return 'info';
      if (['entregado', 'delivered', 'completado', 'completed'].includes(statusValue)) return 'success';
      if (['cancelado', 'cancelled'].includes(statusValue)) return 'error';
    }
    if (statusType === 'payment') {
      if (['pendiente', 'pending'].includes(statusValue)) return 'warning';
      if (['procesando', 'processing'].includes(statusValue)) return 'info';
      if (['completado', 'completed'].includes(statusValue)) return 'success';
      if (['fallido', 'failed', 'reembolsado', 'refunded'].includes(statusValue)) return 'error';
    }
    return null;
  };

  const statusTypes = {
    // Estados de pedidos (en español)
    pendiente: { text: 'Pendiente', type: 'warning' },
    procesando: { text: 'Procesando', type: 'info' },
    enviado: { text: 'Enviado', type: 'info' },
    entregado: { text: 'Entregado', type: 'success' },
    cancelado: { text: 'Cancelado', type: 'error' },
    // Estados de pedidos (en inglés - compatibilidad)
    pending: { text: 'Pendiente', type: 'warning' },
    processing: { text: 'Procesando', type: 'info' },
    completed: { text: 'Completado', type: 'success' },
    cancelled: { text: 'Cancelado', type: 'error' },
    shipped: { text: 'Enviado', type: 'info' },
    delivered: { text: 'Entregado', type: 'success' },
    // Estados de pago
    completado: { text: 'Completado', type: 'success' },
    fallido: { text: 'Fallido', type: 'error' },
    reembolsado: { text: 'Reembolsado', type: 'error' },
    
    // Estados generales
    active: { text: 'Activo', type: 'success' },
    inactive: { text: 'Inactivo', type: 'error' },
    enabled: { text: 'Habilitado', type: 'success' },
    disabled: { text: 'Deshabilitado', type: 'error' },
    
    // Estados de productos
    'in-stock': { text: 'En Stock', type: 'success' },
    'out-of-stock': { text: 'Sin Stock', type: 'error' },
    'low-stock': { text: 'Stock Bajo', type: 'warning' },
    
    // Estados booleanos
    true: { text: 'Sí', type: 'success' },
    false: { text: 'No', type: 'error' },
  };

  // Determinar el tipo de badge según el contexto
  const autoType = getTypeForStatus(status, type);
  const finalType = autoType || (statusTypes[status]?.type || type);
  const statusText = statusTypes[status]?.text || (typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : String(status));
  
  return (
    <span className={`badge ${typeClasses[finalType]} ${className}`}>
      {statusText}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  type: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info', 'order', 'payment']),
  className: PropTypes.string,
};

export default StatusBadge;


