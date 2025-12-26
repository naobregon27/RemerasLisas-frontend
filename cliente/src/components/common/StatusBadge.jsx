import PropTypes from 'prop-types';

const StatusBadge = ({ status, type = 'default', className = '' }) => {
  const typeClasses = {
    default: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  };

  const statusTypes = {
    // Estados de pedidos
    pending: { text: 'Pendiente', type: 'warning' },
    processing: { text: 'Procesando', type: 'info' },
    completed: { text: 'Completado', type: 'success' },
    cancelled: { text: 'Cancelado', type: 'error' },
    shipped: { text: 'Enviado', type: 'info' },
    delivered: { text: 'Entregado', type: 'success' },
    
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

  const statusConfig = statusTypes[status] || { text: status, type: type };
  
  return (
    <span className={`badge ${typeClasses[statusConfig.type]} ${className}`}>
      {statusConfig.text}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  type: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info']),
  className: PropTypes.string,
};

export default StatusBadge;


