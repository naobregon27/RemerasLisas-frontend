import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Componente para proteger rutas basado en autenticación y roles
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useSelector(state => state.auth);

  console.log('ProtectedRoute - Usuario:', user);
  console.log('ProtectedRoute - Rol requerido:', requiredRole);
  console.log('ProtectedRoute - Rol del usuario:', user?.role);

  // Si no hay usuario, redirigir al login
  if (!user) {
    console.log('ProtectedRoute - No hay usuario, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene, redirigir a la ruta correspondiente
  if (requiredRole && user.role !== requiredRole) {
    console.log('ProtectedRoute - Rol no coincide, redirigiendo');
    // Redirigir según el rol actual del usuario
    if (user.role === 'superAdmin') {
      return <Navigate to="/superadmin" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      // Si tiene un rol no reconocido, redirigir al login
      return <Navigate to="/login" replace />;
    }
  }

  // Si está autenticado y tiene el rol requerido, mostrar el contenido
  console.log('ProtectedRoute - Acceso permitido');
  return children;
};

export default ProtectedRoute; 