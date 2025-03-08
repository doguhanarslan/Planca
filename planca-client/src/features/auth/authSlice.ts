import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  login, 
  register, 
  createBusiness, 
  refreshToken, 
  getCurrentUser, 
  logout 
} from './authAPI';
import { 
  AuthState, 
  LoginCredentials, 
  RegisterUserData, 
  BusinessData 
} from '@/types';

// Authentication async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Login failed']);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterUserData, { rejectWithValue }) => {
    try {
      const response = await register(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Registration failed']);
    }
  }
);

export const createBusinessForUser = createAsyncThunk(
  'auth/createBusiness',
  async (businessData: BusinessData, { rejectWithValue }) => {
    try {
      const response = await createBusiness(businessData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Business creation failed']);
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      // Uses refresh token in HttpOnly cookie
      const response = await refreshToken();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Token refresh failed']);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Failed to fetch user data']);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logout();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Logout failed']);
    }
  }
);

const initialState: AuthState = {
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
        const userData = action.payload.data;
        state.user = {
          id: userData.userId,
          email: userData.email,
          name: userData.userName || `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roles: userData.roles || [],
        };
        state.tenant = userData.tenantId ? {
          id: userData.tenantId,
          name: userData.tenantName || 'Unknown Business',
          subdomain: '',
        } : null;
        state.isAuthenticated = true;
        state.isBusinessRegistered = !!userData.tenantId;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string[] | string;
        state.loading = false;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const userData = action.payload.data;
        state.user = {
          id: userData.userId,
          email: userData.email,
          name: userData.userName || `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roles: userData.roles || [],
        };
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload as string[] | string;
        state.loading = false;
      })
      
      // Create business cases
      .addCase(createBusinessForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBusinessForUser.fulfilled, (state, action) => {
        const businessData = action.payload.data;
        state.tenant = {
          id: businessData.id,
          name: businessData.name,
          subdomain: businessData.subdomain,
          ...businessData
        };
        state.isBusinessRegistered = true;
        state.loading = false;
      })
      .addCase(createBusinessForUser.rejected, (state, action) => {
        state.error = action.payload as string[] | string;
        state.loading = false;
      })
      
      // Refresh token cases
      .addCase(refreshUserToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        const userData = action.payload.data;
        if (userData) {
          state.user = {
            id: userData.userId,
            email: userData.email,
            name: userData.userName || `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            roles: userData.roles || [],
          };
          state.tenant = userData.tenantId ? {
            id: userData.tenantId,
            name: userData.tenantName || 'Unknown Business',
            subdomain: '',
          } : null;
          state.isAuthenticated = true;
          state.isBusinessRegistered = !!userData.tenantId;
        }
        state.loading = false;
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        // When token refresh fails, log out the user
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
        state.isBusinessRegistered = false;
        state.error = action.payload as string[] | string;
        state.loading = false;
      })
      
      // Get current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const userData = action.payload.data;
        if (userData) {
          state.user = {
            id: userData.userId,
            email: userData.email,
            name: userData.userName || `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            roles: userData.roles || [],
          };
          state.tenant = userData.tenantId ? {
            id: userData.tenantId,
            name: userData.tenantName || 'Unknown Business',
            subdomain: '',
            ...userData.tenant
          } : null;
          state.isAuthenticated = true;
          state.isBusinessRegistered = !!userData.tenantId;
        }
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.error = action.payload as string[] | string;
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