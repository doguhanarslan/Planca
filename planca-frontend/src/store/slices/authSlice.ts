// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, RegisterCredentials } from '../../types/auth';
import { authService } from '../../services/api';
import axios from 'axios';
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tenant: {
    id: null,
    name: null,
  },
};

// Helper function to extract error message from various error types
const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Server error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchTenant = createAsyncThunk(
  'auth/fetchTenant',
  async (_, { rejectWithValue }) => {
    try {
      const tenantId = await authService.getTenantId();
      
      // Burada tenant adını almak için ekstra bir API çağrısı yapabilirsiniz
      // Örneğin: const tenantData = await api.get(`/tenants/${tenantId}`);
      // Şimdilik sadece ID kullanıyoruz
      
      return { id: tenantId, name: 'Your Tenant' };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = {
        id: action.payload.userId,
        email: action.payload.email,
        userName: action.payload.userName,
        roles: action.payload.roles,
      };
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string || 'Login failed';
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = {
        id: action.payload.userId,
        email: action.payload.email,
        userName: action.payload.userName,
        roles: action.payload.roles,
      };
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string || 'Registration failed';
    });

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
    });
    builder.addCase(logout.rejected, (state) => {
      state.isLoading = false;
    });

    // Fetch current user
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = {
        id: action.payload.userId,
        email: action.payload.email,
        userName: action.payload.userName,
        roles: action.payload.roles,
      };
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload as string || 'Failed to fetch user';
    });
    
    // Fetch tenant
    builder.addCase(fetchTenant.fulfilled, (state, action) => {
      if (action.payload.id) {
        state.tenant.id = action.payload.id;
        state.tenant.name = action.payload.name;
      }
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;