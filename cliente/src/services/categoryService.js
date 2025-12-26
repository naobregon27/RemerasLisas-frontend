import axiosInstance from './axiosConfig';

const categoryService = {
  // Obtener todas las categorías del local
  getCategoriesByLocal: async (localId) => {
    try {
      const response = await axiosInstance.get(`/api/categorias/local/${localId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener categorías' };
    }
  },

  // Obtener subcategorías de una categoría
  getSubcategories: async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/api/categorias/${categoryId}/subcategorias`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener subcategorías' };
    }
  },

  // Crear una nueva categoría
  createCategory: async (categoryData) => {
    try {
      const response = await axiosInstance.post('/api/categorias', categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear categoría' };
    }
  },

  // Actualizar una categoría existente
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await axiosInstance.put(`/api/categorias/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar categoría' };
    }
  },

  // Eliminar una categoría
  deleteCategory: async (categoryId) => {
    try {
      const response = await axiosInstance.delete(`/api/categorias/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar categoría' };
    }
  },

  // Restaurar/activar una categoría
  restoreCategory: async (categoryId) => {
    try {
      const response = await axiosInstance.patch(`/api/categorias/${categoryId}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al restaurar categoría' };
    }
  }
};

export default categoryService; 
