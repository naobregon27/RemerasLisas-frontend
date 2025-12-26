import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

// Thunks asíncronos
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (storeSlug, { rejectWithValue }) => {
    try {
      const response = await productService.getAllProducts(storeSlug);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar productos');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async ({ storeSlug, productData }, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(storeSlug, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear producto');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ storeSlug, productId, productData }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(storeSlug, productId, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar producto');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async ({ storeSlug, productId }, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(storeSlug, productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar producto');
    }
  }
);

// Estado inicial
const initialState = {
  items: [],
  currentProduct: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: {
    search: '',
    category: '',
    status: '',
  },
};

// Slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  setCurrentProduct, 
  clearCurrentProduct, 
  setFilters, 
  clearFilters, 
  resetError 
} = productSlice.actions;

export default productSlice.reducer;


