import axiosInstance from './axiosConfig';

const orderService = {
  // Obtener todos los pedidos del administrador
  getAdminOrders: async () => {
    try {
      const response = await axiosInstance.get('/api/pedidos/admin/pedidos');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener pedidos' };
    }
  },

  // Obtener un pedido específico por ID
  getOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/pedidos/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el pedido' };
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
  getAdminOrdersV2: async () => {
    try {
      const response = await axiosInstance.get('/api/pedidos/admin/pedidos');
      // Devuelve solo el array de pedidos
      if (response.data && Array.isArray(response.data.pedidos)) {
        return response.data.pedidos;
      }
      // Si la respuesta no tiene el formato esperado, devuelve un array vacío
      return [];
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener pedidos' };
    }
  }
};

export default orderService; 
