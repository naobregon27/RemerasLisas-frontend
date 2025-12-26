import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import { logout } from './redux/slices/authSlice';

// Componentes de autenticación
import LoginPage from './pages/auth/LoginPage';

// Componentes para administradores
import AdminDashboard from './pages/admin/Dashboard';
import SuperAdminDashboard from './pages/superAdmin/Dashboard';

// Componente para proteger rutas
import ProtectedRoute from './routes/ProtectedRoute';

// Componente para limpiar toasts persistentes
import ToastCleanup from './components/ToastCleanup';

function App() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Limpiar usuario al cargar la app (forzar login siempre)
  // Solo limpiar si no hay usuario en Redux para evitar conflictos
  useEffect(() => {
    if (!user) {
      localStorage.removeItem('user');
    }
  }, []);

  // Efecto para manejar la navegación normal después de iniciar sesión
  useEffect(() => {
    console.log('App - Usuario en Redux:', user);
    console.log('App - Ruta actual:', location.pathname);
    
    // Si el usuario inicia sesión y está en /login, redirigir a su panel
    if (user && location.pathname === '/login') {
      console.log('App - Redirigiendo usuario con rol:', user.role);
      if (user.role === 'superAdmin') {
        navigate('/superadmin', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <>
    <Routes>
      {/* Ruta principal - Siempre redirige a /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Ruta de login */}
      <Route 
        path="/login" 
        element={<LoginPage />} 
      />

      {/* Rutas protegidas para admin */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Rutas protegidas para superAdmin */}
      <Route 
        path="/superadmin" 
        element={
          <ProtectedRoute requiredRole="superAdmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Ruta para manejar 404 - Siempre redirige a /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="glass-card"
      />
      <ToastCleanup />
    </>
  );
}

export default App;
