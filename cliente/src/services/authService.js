import axiosInstance from './axiosConfig';

const authService = {
  // Función para iniciar sesión
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials);
      
      // El backend devuelve: { success: true, message: '...', data: { token: '...', user: {...} } }
      let userData;
      
      if (response.data.data) {
        const { token, user } = response.data.data;
        userData = {
          token,
          ...user,
        };
      } else {
        userData = response.data;
      }
      
      if (userData.token) {
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ Login exitoso');
      } else {
        console.warn('⚠️ No se recibió token en la respuesta');
      }
      
      return userData;
    } catch (error) {
      console.error('❌ Error en login:', error.response?.data?.message || error.message);
      throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
  },

  // Función para cerrar sesión
  logout: async () => {
    try {
      const response = await axiosInstance.post('/api/auth/logout');
      // Limpiar el localStorage después de cerrar sesión exitosamente
      localStorage.removeItem('user');
      return response.data;
    } catch (error) {
      // Aún así, limpiar el localStorage en caso de error
      localStorage.removeItem('user');
      throw error.response?.data || { message: 'Error al cerrar sesión' };
    }
  },

  // Función para obtener el usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    
    if (!user) return null;
    
    try {
      const parsedUser = JSON.parse(user);
      
      // Si el usuario está en formato anidado, extraer los datos
      if (parsedUser.data && parsedUser.data.user) {
        const { token, user: userInfo } = parsedUser.data;
        return {
          token,
          ...userInfo
        };
      }
      
      return parsedUser;
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      return null;
    }
  },

  // Función para verificar si el usuario está autenticado
  isAuthenticated: () => {
    const user = authService.getCurrentUser();
    return !!user?.token;
  },

  // Función para verificar si el usuario tiene un rol específico
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },

  // Función para obtener el perfil del usuario (según API_DOCUMENTATION.md línea 251)
  getProfile: async (options = {}) => {
    try {
      const response = await axiosInstance.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      if (options.silentError) {
        return { success: true, data: { user: {} } };
      }
      throw error.response?.data || { message: 'Error al obtener perfil' };
    }
  },

  // Actualizar perfil del usuario (según API_DOCUMENTATION.md línea 280)
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/api/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar perfil' };
    }
  },

  // Obtener cantidad de usuarios recientes - Endpoint de admin
  getRecentUsers: async (since) => {
    try {
      const timestamp = since ? new Date(since).toISOString() : new Date(0).toISOString();
      const response = await axiosInstance.get(`/api/users?search=&page=1&limit=1000`);
      
      if (response.data?.success && response.data?.data?.users) {
        const users = response.data.data.users;
        const sinceDate = new Date(timestamp);
        const recentUsers = users.filter(user => new Date(user.createdAt) >= sinceDate);
        return { count: recentUsers.length };
      }
      
      return { count: 0 };
    } catch (error) {
      return { count: 0 };
    }
  }
};

export default authService; 
