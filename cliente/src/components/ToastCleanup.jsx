import { useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Componente auxiliar para limpiar notificaciones toast persistentes
 * Se monta una vez y limpia las notificaciones pendientes
 */
const ToastCleanup = () => {
  useEffect(() => {
    // Al montar, eliminar todas las notificaciones pendientes
    toast.dismiss();
    
    // Configurar un intervalo para limpiar periódicamente
    const intervalId = setInterval(() => {
      // Limpiar cualquier mensaje que haya estado más de 5 segundos
      toast.dismiss();
    }, 5000);
    
    // Limpiar el intervalo al desmontar
    return () => clearInterval(intervalId);
  }, []);

  // Este componente no renderiza nada
  return null;
};

export default ToastCleanup; 