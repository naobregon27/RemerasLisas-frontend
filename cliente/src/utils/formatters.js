/**
 * Utilidades para formatear datos en la aplicación
 */

/**
 * Formatea un precio en formato de moneda
 * @param {number} value - El valor a formatear
 * @param {string} currency - El símbolo de moneda (por defecto '$')
 * @returns {string} El precio formateado
 */
export const formatPrice = (value, currency = '$') => {
  if (value === null || value === undefined) return `${currency} 0.00`;
  
  return `${currency} ${Number(value).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Formatea una fecha al formato local
 * @param {string} dateString - La fecha en formato ISO o string
 * @param {object} options - Opciones para el formato (opcional)
 * @returns {string} La fecha formateada
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Fecha no disponible';
  
  const date = new Date(dateString);
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return 'Fecha inválida';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return date.toLocaleDateString('es-AR', mergedOptions);
}; 