import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Thunk para iniciar sesión
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al iniciar sesión');
    }
  }
);

// Thunk para cerrar sesión
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    authService.logout();
  }
);

// Estado inicial
const initialState = {
  user: authService.getCurrentUser(),
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Slice de autenticación
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
      state.status = 'idle';
    },
    /** Sincroniza el objeto `local` completo en Redux y localStorage una vez que el Dashboard lo resuelve. */
    updateUserLocal: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, local: action.payload };
        try { localStorage.setItem('user', JSON.stringify(state.user)); } catch { /* storage full */ }
      }
    },
    /** Reemplaza todo el objeto user (útil al hidratar desde localStorage en otros contextos). */
    setUserData: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
        // Asegurar que el usuario también esté en localStorage
        if (action.payload && action.payload.token) {
          localStorage.setItem('user', JSON.stringify(action.payload));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      });
  },
});

export const { resetError, updateUserLocal, setUserData } = authSlice.actions;
export default authSlice.reducer; 