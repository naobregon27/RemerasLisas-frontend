import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';

// Thunks asíncronos
export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (storeSlug, { rejectWithValue }) => {
    try {
      const response = await orderService.getAllOrders(storeSlug);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar órdenes');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ storeSlug, orderId, status }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(storeSlug, orderId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar estado');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/delete',
  async ({ storeSlug, orderId }, { rejectWithValue }) => {
    try {
      await orderService.deleteOrder(storeSlug, orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar orden');
    }
  }
);

// Estado inicial
const initialState = {
  items: [],
  currentOrder: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: {
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  },
  stats: {
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  },
};

// Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateStats: (state) => {
      state.stats.total = state.items.length;
      state.stats.pending = state.items.filter(o => o.status === 'pending').length;
      state.stats.processing = state.items.filter(o => o.status === 'processing').length;
      state.stats.completed = state.items.filter(o => o.status === 'completed').length;
      state.stats.cancelled = state.items.filter(o => o.status === 'cancelled').length;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
        // Actualizar stats automáticamente
        orderSlice.caseReducers.updateStats(state);
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
        orderSlice.caseReducers.updateStats(state);
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item._id !== action.payload);
        state.error = null;
        orderSlice.caseReducers.updateStats(state);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  setCurrentOrder, 
  clearCurrentOrder, 
  setFilters, 
  clearFilters, 
  updateStats,
  resetError 
} = orderSlice.actions;

export default orderSlice.reducer;


