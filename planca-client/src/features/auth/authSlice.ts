import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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
  BusinessData, 
  User,
  Tenant
} from '@/types/index';

/**
 * Async thunk for user login
 */
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

/**
 * Async thunk for user registration
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterUserData, { rejectWithValue }) => {
    // Daha detaylı undefined kontrolü
    if (!userData || typeof userData !== 'object') {
      return rejectWithValue(['Geçersiz kayıt verileri']);
    }

    try {
      // Gerekli alanların varlığını ve tipini kontrol et
      const requiredFields = ['email', 'password', 'firstName', 'lastName'] as const;
      const validations = {
        email: (v: string) => typeof v === 'string' && v.includes('@'),
        password: (v: string) => typeof v === 'string' && v.length >= 6,
        firstName: (v: string) => typeof v === 'string' && v.length > 0,
        lastName: (v: string) => typeof v === 'string' && v.length > 0
      };

      for (const field of requiredFields) {
        const value = userData[field];
        if (!value) {
          return rejectWithValue([`${field} alanı gereklidir`]);
        }
        if (!validations[field](value)) {
          return rejectWithValue([`${field} alanı geçersiz`]);
        }
      }

      const response = await register(userData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors || 
                          error.response?.data?.message || 
                          error.message || 
                          'Kayıt işlemi başarısız';
      return rejectWithValue(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
    }
  }
);

/**
 * Async thunk for business creation
 */
export const createBusinessForUser = createAsyncThunk(
  'auth/create-business',
  async (businessData: BusinessData, { rejectWithValue }) => {
    try {
      const response = await createBusiness(businessData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Business creation failed']);
    }
  }
);
/**
 * Async thunk for token refresh
 */
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

/**
 * Async thunk for fetching current user data
 */
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

/**
 * Async thunk for user logout
 */
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

/**
 * Initial state for auth slice
 */
const initialState: AuthState = {
  user: null,
  tenant: null,
  isAuthenticated: false,
  isBusinessRegistered: false,
  loading: false,
  error: null,
};

/**
 * Format user data from API response
 */
function formatUserData(userData: any): User {
  if (!userData) {
    throw new Error('Kullanıcı verisi bulunamadı');
  }

  return {
    id: userData.userId || userData.id,
    email: userData.email,
    name: userData.userName || `${userData.firstName} ${userData.lastName}`,
    firstName: userData.firstName,
    lastName: userData.lastName,
    roles: userData.roles || [],
  };
}

/**
 * Format tenant data from API response
 */
function formatTenantData(tenantData: any): Tenant | null {
  if (!tenantData?.tenantId) return null;
  
  return {
    id: tenantData.tenantId,
    name: tenantData.tenantName || 'Unknown Business',
    subdomain: tenantData.subdomain || '',
    ...tenantData.tenant
  };
}

/**
 * Authentication slice with reducers and extra reducers
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: () => initialState,
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateTenantInfo: (state, action: PayloadAction<Partial<Tenant>>) => {
      if (state.tenant) {
        state.tenant = { ...state.tenant, ...action.payload };
      }
    }
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
        state.user = formatUserData(userData);
        state.tenant = formatTenantData(userData);
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
        const userData = action.payload?.data || action.payload;
        if (userData) {
          // Kullanıcı verilerini formatlayıp state'e kaydediyoruz
          state.user = formatUserData(userData);
          // Token'ı localStorage'a kaydediyoruz
          if (userData.token) {
            localStorage.setItem('token', userData.token);
          }
          // Kullanıcıyı giriş yapmış olarak işaretliyoruz
          state.isAuthenticated = true;
          state.isBusinessRegistered = false;
        }
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
          state.user = formatUserData(userData);
          state.tenant = formatTenantData(userData);
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
          state.user = formatUserData(userData);
          state.tenant = formatTenantData(userData);
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

export const { clearError, resetAuthState, updateUserProfile, updateTenantInfo } = authSlice.actions;

export default authSlice.reducer;