import axios from './axiosConfig';

/**
 * Servicio para gestionar usuarios
 */
const userService = {
  /**
   * Obtiene todos los usuarios activos del local
   * @returns {Promise<Array>} Lista de usuarios
   */
  getUsers: async () => {
    try {
      const response = await axios.get('/api/users/local');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene todos los usuarios inactivos del local
   * @returns {Promise<Array>} Lista de usuarios inactivos
   */
  getInactiveUsers: async () => {
    try {
      const response = await axios.get('/api/users/inactive');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios inactivos:', error);
      throw error;
    }
  },

  /**
   * Obtiene información detallada de un usuario específico
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuario ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Actualiza datos de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise<Object>} Usuario actualizado
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar usuario ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Desactiva/elimina un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Respuesta de la operación
   */
  deactivateUser: async (userId) => {
    try {
      const response = await axios.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al desactivar usuario ${userId}:`, error);
      throw error;
    }
  },

  // Obtener todos los usuarios del local (según API_DOCUMENTATION.md línea 1511)
  getAllUsers: async () => {
    try {
      const response = await axios.get('/api/users/local');
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      if (response.data?.success && Array.isArray(response.data?.data?.users)) {
        return response.data.data.users;
      }
      
      if (Array.isArray(response.data.usuarios)) {
        return response.data.usuarios;
      }
      
      return [];
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuarios' };
    }
  }
};

export default userService; 
