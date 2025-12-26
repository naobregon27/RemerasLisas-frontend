import axiosInstance from './axiosConfig';

const localService = {
  // Obtener todos los locales
  getAllLocales: async () => {
    try {
      const response = await axiosInstance.get('/api/locales');
      return response.data;
    } catch (error) {
      console.error('Error al obtener locales:', error);
      throw error.response?.data || { message: 'Error al obtener locales' };
    }
  },

  // Obtener un local por ID
  getLocalById: async (localId) => {
    try {
      const response = await axiosInstance.get(`/api/locales/${localId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener local:', error);
      throw error.response?.data || { message: 'Error al obtener local' };
    }
  },

  // Crear un nuevo local
  createLocal: async (localData) => {
    try {
      const response = await axiosInstance.post('/api/locales', localData);
      return response.data;
    } catch (error) {
      console.error('Error al crear local:', error);
      throw error.response?.data || { message: 'Error al crear local' };
    }
  },

  // Actualizar un local
  updateLocal: async (localId, localData) => {
    try {
      const response = await axiosInstance.put(`/api/locales/${localId}`, localData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar local:', error);
      throw error.response?.data || { message: 'Error al actualizar local' };
    }
  },

  // Eliminar un local
  deleteLocal: async (localId) => {
    try {
      const response = await axiosInstance.delete(`/api/locales/${localId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar local:', error);
      throw error.response?.data || { message: 'Error al eliminar local' };
    }
  }
};

export default localService;

