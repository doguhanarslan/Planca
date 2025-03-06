import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, createBusiness, refreshToken, getCurrentUser, logout } from './authAPI';

// Authentication async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || ['Giriş başarısız']);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || ['Kayıt başarısız']);
    }
  }
);

export const createBusinessForUser = createAsyncThunk(
  'auth/createBusiness',
  async (businessData, { rejectWithValue }) => {
    try {
      const response = await createBusiness(businessData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || ['İşletme oluşturma başarısız']);
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      // HttpOnly cookie içinde refresh token'ı kullanacak
      const response = await refreshToken();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || ['Token yenileme başarısız']);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || ['Kullanıcı bilgileri alınamadı']);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || ['Çıkış başarısız']);
    }
  }
);

const initialState = {
  user: null,
  tenant: null,
  isAuthenticated: false,
  isBusinessRegistered: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = {
          id: action.payload.data.userId,
          email: action.payload.data.email,
          name: action.payload.data.userName || `${action.payload.data.firstName} ${action.payload.data.lastName}`,
          firstName: action.payload.data.firstName,
          lastName: action.payload.data.lastName,
          roles: action.payload.data.roles || [],
        };
        state.tenant = action.payload.data.tenantId ? {
          id: action.payload.data.tenantId,
          name: action.payload.data.tenantName
        } : null;
        state.isAuthenticated = true;
        state.isBusinessRegistered = !!action.payload.data.tenantId;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = {
          id: action.payload.data.userId,
          email: action.payload.data.email,
          name: action.payload.data.userName || `${action.payload.data.firstName} ${action.payload.data.lastName}`,
          firstName: action.payload.data.firstName,
          lastName: action.payload.data.lastName,
          roles: action.payload.data.roles || [],
        };
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // Create business cases
      .addCase(createBusinessForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBusinessForUser.fulfilled, (state, action) => {
        state.tenant = {
          id: action.payload.data.id,
          name: action.payload.data.name,
          subdomain: action.payload.data.subdomain,
          ...action.payload.data
        };
        state.isBusinessRegistered = true;
        state.loading = false;
      })
      .addCase(createBusinessForUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // Refresh token cases
      .addCase(refreshUserToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.user = {
            id: action.payload.data.userId,
            email: action.payload.data.email,
            name: action.payload.data.userName || `${action.payload.data.firstName} ${action.payload.data.lastName}`,
            roles: action.payload.data.roles || [],
          };
          state.tenant = action.payload.data.tenantId ? {
            id: action.payload.data.tenantId,
            name: action.payload.data.tenantName
          } : null;
          state.isAuthenticated = true;
          state.isBusinessRegistered = !!action.payload.data.tenantId;
        }
        state.loading = false;
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        // Token yenileme başarısız olduğunda kullanıcıyı logout yap
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
        state.isBusinessRegistered = false;
        state.error = action.payload;
        state.loading = false;
      })
      
      // Get current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.user = {
            ...action.payload.data,
            name: action.payload.data.userName || `${action.payload.data.firstName} ${action.payload.data.lastName}`,
          };
          state.tenant = action.payload.data.tenantId ? {
            id: action.payload.data.tenantId,
            name: action.payload.data.tenantName,
            ...action.payload.data.tenant
          } : null;
          state.isAuthenticated = true;
          state.isBusinessRegistered = !!action.payload.data.tenantId;
        }
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
        state.isBusinessRegistered = false;
        state.loading = false;
      });
  },
});

export const { clearError, resetAuthState } = authSlice.actions;

export default authSlice.reducer;