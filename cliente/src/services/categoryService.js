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
      // Si hay imagen, usar FormData con multipart/form-data
      if (categoryData.imagen || (categoryData instanceof FormData)) {
        const formData = categoryData instanceof FormData 
          ? categoryData 
          : new FormData();
        
        if (!(categoryData instanceof FormData)) {
          formData.append('nombre', categoryData.nombre || '');
          formData.append('descripcion', categoryData.descripcion || '');
          if (categoryData.localId) formData.append('localId', categoryData.localId);
          if (categoryData.categoriaPadreId) formData.append('categoriaPadreId', categoryData.categoriaPadreId);
          if (categoryData.imagen) formData.append('imagen', categoryData.imagen);
        }
        
        const response = await axiosInstance.post('/api/categorias', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        // Sin imagen, enviar como JSON normal
        const response = await axiosInstance.post('/api/categorias', categoryData);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear categoría' };
    }
  },

  // Actualizar una categoría existente
  updateCategory: async (categoryId, categoryData) => {
    try {
      // Si hay imagen, usar FormData con multipart/form-data
      if (categoryData.imagen || (categoryData instanceof FormData)) {
        const formData = categoryData instanceof FormData 
          ? categoryData 
          : new FormData();
        
        if (!(categoryData instanceof FormData)) {
          if (categoryData.nombre) formData.append('nombre', categoryData.nombre);
          if (categoryData.descripcion) formData.append('descripcion', categoryData.descripcion);
          if (categoryData.localId) formData.append('localId', categoryData.localId);
          if (categoryData.categoriaPadreId) formData.append('categoriaPadreId', categoryData.categoriaPadreId);
          if (categoryData.imagen) formData.append('imagen', categoryData.imagen);
        }
        
        const response = await axiosInstance.put(`/api/categorias/${categoryId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        // Sin imagen, enviar como JSON normal
        const response = await axiosInstance.put(`/api/categorias/${categoryId}`, categoryData);
        return response.data;
      }
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
  },

  // Obtener todas las categorías activas con cantidad de productos
  getCategoriesWithProductCount: async (localId = null) => {
    try {
      const url = localId 
        ? `/api/categorias/productos/cantidad?local=${localId}`
        : '/api/categorias/productos/cantidad';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener categorías con cantidad de productos' };
    }
  },

  // Obtener una categoría por ID o slug (detalles completos)
  // localId es opcional pero recomendado cuando se busca por slug para evitar ambigüedad
  getCategoryById: async (categoryId, localId = null) => {
    try {
      let url = `/api/categorias/${categoryId}`;
      // Si se proporciona localId, agregarlo como query param (recomendado para búsquedas por slug)
      if (localId) {
        url += `?local=${localId}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener categoría' };
    }
  }
};

export default categoryService; 
