import axios from './axiosConfig';

/**
 * Servicio para gestionar usuarios
 */
const userService = {
  /**
   * Obtiene todos los usuarios activos del local asignado al admin
   * GET /api/users/local
   * @returns {Promise<Array>} Lista de usuarios del local
   */
  getUsers: async () => {
    try {
      const response = await axios.get('/api/users/local');
      
      // Log para depuración
      console.log('📥 Respuesta de /api/users/local:', response.data);
      
      // Manejar diferentes formatos de respuesta
      let usersArray = [];
      
      if (Array.isArray(response.data)) {
        usersArray = response.data;
      } else if (response.data?.success && Array.isArray(response.data?.data)) {
        usersArray = response.data.data;
      } else if (Array.isArray(response.data?.data?.users)) {
        usersArray = response.data.data.users;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        usersArray = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Si es un objeto único, convertirlo a array
        usersArray = [response.data];
      }
      
      // Asegurarse de que siempre devolvemos un array
      if (!Array.isArray(usersArray)) {
        console.warn('⚠️ La respuesta no es un array, convirtiendo:', usersArray);
        usersArray = [];
      }
      
      console.log(`✅ Usuarios obtenidos: ${usersArray.length}`, usersArray);
      
      return usersArray;
    } catch (error) {
      console.error('❌ Error al obtener usuarios del local:', error);
      throw error.response?.data || { message: 'Error al obtener usuarios del local' };
    }
  },

  /**
   * Obtiene todos los usuarios con paginación y filtros
   * GET /api/users?page=1&limit=10&role=usuario&isActive=true&search=juan
   * @param {Object|string} params - Parámetros de consulta o storeSlug (para compatibilidad)
   * @param {number} params.page - Número de página (default: 1)
   * @param {number} params.limit - Items por página (default: 10)
   * @param {string} params.role - Filtrar por rol (usuario, admin, superAdmin)
   * @param {boolean} params.isActive - Filtrar por estado activo
   * @param {boolean} params.isEmailVerified - Filtrar por email verificado
   * @param {string} params.search - Búsqueda en nombre, email o teléfono
   * @returns {Promise<Object|Array>} Respuesta con usuarios, paginación y estadísticas, o array directo para compatibilidad
   */
  getAllUsers: async (params = {}) => {
    try {
      // Si params es un string (storeSlug para compatibilidad con userSlice)
      if (typeof params === 'string') {
        // Para compatibilidad con código existente, usar endpoint local
        const response = await axios.get('/api/users/local');
        let usersArray = [];
        
        // Extraer array de usuarios
        if (Array.isArray(response.data)) {
          usersArray = response.data;
        } else if (response.data?.success && Array.isArray(response.data?.data)) {
          usersArray = response.data.data;
        } else if (Array.isArray(response.data?.data?.users)) {
          usersArray = response.data.data.users;
        }
        
        // Retornar objeto con estructura para userSlice (accede a response.data)
        return {
          data: usersArray,
          success: true
        };
      }
      
      // Si params es un objeto vacío o sin propiedades de paginación (llamada desde Dashboard)
      const hasPaginationParams = params.page || params.limit || params.role || 
                                   params.isActive !== undefined || 
                                   params.isEmailVerified !== undefined || 
                                   params.search;
      
      if (!hasPaginationParams && Object.keys(params).length === 0) {
        // Llamada sin parámetros desde Dashboard - retornar array directo
        const response = await axios.get('/api/users/local');
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (response.data?.success && Array.isArray(response.data?.data)) {
          return response.data.data;
        }
        if (Array.isArray(response.data?.data?.users)) {
          return response.data.data.users;
        }
        return [];
      }
      
      // Si params es un objeto con parámetros de paginación/filtros, usar endpoint optimizado
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.role) queryParams.append('role', params.role);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      if (params.isEmailVerified !== undefined) queryParams.append('isEmailVerified', params.isEmailVerified);
      if (params.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      const url = `/api/users${queryString ? `?${queryString}` : ''}`;
      
      const response = await axios.get(url);
      
      // Manejar diferentes formatos de respuesta
      if (response.data?.success && response.data?.data) {
        return response.data;
      }
      
      // Si viene como array directo (compatibilidad)
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: {
            users: response.data,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: response.data.length,
              itemsPerPage: response.data.length,
              hasNextPage: false,
              hasPreviousPage: false
            }
          }
        };
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuarios' };
    }
  },

  /**
   * Obtiene todos los usuarios inactivos del local
   * GET /api/users/inactive
   * @returns {Promise<Array>} Lista de usuarios inactivos
   */
  getInactiveUsers: async () => {
    try {
      const response = await axios.get('/api/users/inactive');
      
      // Log para depuración
      console.log('📥 Respuesta de /api/users/inactive:', response.data);
      
      // Manejar diferentes formatos de respuesta
      let usersArray = [];
      
      if (Array.isArray(response.data)) {
        usersArray = response.data;
      } else if (response.data?.success && Array.isArray(response.data?.data)) {
        usersArray = response.data.data;
      } else if (Array.isArray(response.data?.data?.users)) {
        usersArray = response.data.data.users;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        usersArray = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Si es un objeto único, convertirlo a array
        usersArray = [response.data];
      }
      
      // Asegurarse de que siempre devolvemos un array
      if (!Array.isArray(usersArray)) {
        console.warn('⚠️ La respuesta no es un array, convirtiendo:', usersArray);
        usersArray = [];
      }
      
      console.log(`✅ Usuarios inactivos obtenidos: ${usersArray.length}`, usersArray);
      
      return usersArray;
    } catch (error) {
      console.error('❌ Error al obtener usuarios inactivos:', error);
      throw error.response?.data || { message: 'Error al obtener usuarios inactivos' };
    }
  },

  /**
   * Obtiene información detallada de un usuario específico
   * GET /api/users/:id
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Datos completos del usuario
   */
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      // Manejar diferentes formatos de respuesta
      if (response.data?.success && response.data?.data?.user) {
        return response.data;
      }
      if (response.data?.success && response.data?.data) {
        return response.data;
      }
      return {
        success: true,
        data: {
          user: response.data
        }
      };
    } catch (error) {
      console.error(`Error al obtener usuario ${userId}:`, error);
      throw error.response?.data || { message: 'Error al obtener usuario' };
    }
  },

  /**
   * Actualiza datos de un usuario
   * PUT /api/users/:id
   * @param {string} storeSlug - Slug de la tienda (opcional, para compatibilidad)
   * @param {string} userId - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario (opcional si storeSlug es objeto)
   * @returns {Promise<Object>} Usuario actualizado
   */
  updateUser: async (storeSlug, userId, userData) => {
    try {
      // Manejar diferentes firmas de llamada para compatibilidad
      let actualUserId, actualUserData;
      
      if (typeof storeSlug === 'string' && typeof userId === 'string') {
        // Llamada: updateUser(storeSlug, userId, userData)
        actualUserId = userId;
        actualUserData = userData;
      } else if (typeof storeSlug === 'string' && typeof userId === 'object') {
        // Llamada: updateUser(userId, userData) - sin storeSlug
        actualUserId = storeSlug;
        actualUserData = userId;
      } else {
        // Fallback
        actualUserId = userId;
        actualUserData = userData;
      }
      
      const response = await axios.put(`/api/users/${actualUserId}`, actualUserData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar usuario:`, error);
      throw error.response?.data || { message: 'Error al actualizar usuario' };
    }
  },

  /**
   * Desactiva un usuario (soft delete)
   * DELETE /api/users/:id
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Respuesta de la operación
   */
  deactivateUser: async (userId) => {
    try {
      const response = await axios.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al desactivar usuario ${userId}:`, error);
      throw error.response?.data || { message: 'Error al desactivar usuario' };
    }
  },

  /**
   * Restaura/activa un usuario
   * PATCH /api/users/:id/restore
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Respuesta de la operación
   */
  reactivateUser: async (userId) => {
    try {
      const response = await axios.patch(`/api/users/${userId}/restore`);
      return response.data;
    } catch (error) {
      console.error(`Error al reactivar usuario ${userId}:`, error);
      throw error.response?.data || { message: 'Error al reactivar usuario' };
    }
  },

  /**
   * Cambia el estado activo/inactivo de un usuario
   * PATCH /api/users/:id/toggle-status
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Respuesta de la operación
   */
  toggleUserStatus: async (userId) => {
    try {
      const response = await axios.patch(`/api/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado del usuario ${userId}:`, error);
      throw error.response?.data || { message: 'Error al cambiar estado del usuario' };
    }
  },

  /**
   * Crea un nuevo usuario (para compatibilidad con userSlice)
   * @param {string} storeSlug - Slug de la tienda (opcional, para compatibilidad)
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise<Object>} Usuario creado
   */
  createUser: async (storeSlug, userData) => {
    try {
      // Si se proporciona storeSlug, podría usarse en la URL si es necesario
      // Por ahora, asumimos que el endpoint es POST /api/users
      const response = await axios.post('/api/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error.response?.data || { message: 'Error al crear usuario' };
    }
  },

  /**
   * Elimina un usuario (para compatibilidad con userSlice)
   * @param {string} storeSlug - Slug de la tienda (opcional, para compatibilidad)
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Respuesta de la operación
   */
  deleteUser: async (storeSlug, userId) => {
    try {
      // Usar el método de desactivación
      const response = await axios.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar usuario ${userId}:`, error);
      throw error.response?.data || { message: 'Error al eliminar usuario' };
    }
  }
};

export default userService; 
