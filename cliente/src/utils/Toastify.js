import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Función para mostrar notificaciones con react-toastify
 * @param {Object} options - Opciones de configuración
 * @param {string} options.type - Tipo de notificación: 'success', 'error', 'info', 'warning'
 * @param {string} options.message - Mensaje a mostrar
 * @param {number} [options.autoClose=5000] - Tiempo en ms para auto cerrar la notificación
 */
export const Toastify = ({ type, message, autoClose = 5000 }) => {
  const toastConfig = {
    position: "top-right",
    autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

  switch (type) {
    case 'success':
      toast.success(message, toastConfig);
      break;
    case 'error':
      toast.error(message, toastConfig);
      break;
    case 'info':
      toast.info(message, toastConfig);
      break;
    case 'warning':
      toast.warning(message, toastConfig);
      break;
    default:
      toast(message, toastConfig);
      break;
  }
}; 