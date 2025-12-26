import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../services/categoryService';

// Thunks asíncronos
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (storeSlug, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories(storeSlug);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar categorías');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async ({ storeSlug, categoryData }, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(storeSlug, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear categoría');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ storeSlug, categoryId, categoryData }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(storeSlug, categoryId, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar categoría');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async ({ storeSlug, categoryId }, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(storeSlug, categoryId);
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar categoría');
    }
  }
);

// Estado inicial
const initialState = {
  items: [],
  currentCategory: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Slice
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  setCurrentCategory, 
  clearCurrentCategory, 
  resetError 
} = categorySlice.actions;

export default categorySlice.reducer;


