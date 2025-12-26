import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

// Thunks asíncronos
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (storeSlug, { rejectWithValue }) => {
    try {
      const response = await userService.getAllUsers(storeSlug);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar usuarios');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async ({ storeSlug, userData }, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(storeSlug, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear usuario');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ storeSlug, userId, userData }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(storeSlug, userId, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar usuario');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async ({ storeSlug, userId }, { rejectWithValue }) => {
    try {
      await userService.deleteUser(storeSlug, userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar usuario');
    }
  }
);

// Estado inicial
const initialState = {
  items: [],
  currentUser: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filters: {
    search: '',
    role: '',
    status: '',
  },
};

// Slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
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
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  setCurrentUser, 
  clearCurrentUser, 
  setFilters, 
  clearFilters, 
  resetError 
} = userSlice.actions;

export default userSlice.reducer;




