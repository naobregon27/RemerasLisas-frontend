import axiosInstance from './axiosConfig';

const orderService = {
  // Obtener todos los pedidos del administrador
  getAdminOrders: async (filters = {}) => {
    try {
      const { estadoPedido, estadoPago, page, limit } = filters;
      let url = '/api/pedidos/admin/pedidos';
      const params = new URLSearchParams();
      
      if (estadoPedido) params.append('estadoPedido', estadoPedido);
      if (estadoPago) params.append('estadoPago', estadoPago);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener pedidos' };
    }
  },

  // Obtener un pedido específico por ID
  getOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/pedidos/${orderId}`);
      // El backend puede devolver el pedido directamente o envuelto
      return response.data.pedido || response.data || response;
    } catch (error) {
      const errorData = error.response?.data || { message: 'Error al obtener el pedido' };
      throw errorData;
    }
  },

  // Actualizar el estado de un pedido
  updateOrderStatus: async (orderId, statusData) => {
    try {
      // Asegurarse de que el campo se llame "estado" en la petición
      const payload = {
        estado: statusData.estado,
        notas: statusData.notas
      };
      const response = await axiosInstance.put(`/api/pedidos/${orderId}/estado`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el estado del pedido' };
    }
  },

  // Actualizar el estado de pago de un pedido
  updatePaymentStatus: async (orderId, paymentData) => {
    try {
      const response = await axiosInstance.put(`/api/pedidos/${orderId}/pago`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el estado de pago' };
    }
  },

  // Obtener cantidad de pedidos recientes desde una fecha específica
  getRecentOrders: async (since) => {
    try {
      // Si no hay fecha, usar una fecha antigua por defecto
      const timestamp = since ? new Date(since).toISOString() : new Date(0).toISOString();
      
      const response = await axiosInstance.get(`/api/pedidos/admin/recientes?desde=${timestamp}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedidos recientes:', error);
      // No lanzar error, simplemente devolver 0 para manejar silenciosamente el fallo
      return { count: 0 };
    }
  },

  // Obtener todos los pedidos del administrador (nuevo formato)
  getAdminOrdersV2: async (filters = {}) => {
    try {
      const { estadoPedido, estadoPago, page, limit } = filters;
      let url = '/api/pedidos/admin/pedidos';
      const params = new URLSearchParams();
      
      if (estadoPedido) params.append('estadoPedido', estadoPedido);
      if (estadoPago) params.append('estadoPago', estadoPago);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axiosInstance.get(url);
      // Devuelve solo el array de pedidos
      if (response.data && Array.isArray(response.data.pedidos)) {
        return response.data.pedidos;
      }
      // Si la respuesta no tiene el formato esperado, devuelve un array vacío
      return [];
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener pedidos' };
    }
  },

  // Eliminar un pedido
  deleteOrder: async (orderId) => {
    try {
      const response = await axiosInstance.delete(`/api/pedidos/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar el pedido' };
    }
  }
};

export default orderService; 
