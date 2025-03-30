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
  'Auth/login',
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
      console.log('Action received data:', businessData); // Debug için log
      if (!businessData) {
        throw new Error('Business data is required');
      }
      
      const response = await createBusiness(businessData);
      return response.data;
    } catch (error: any) {
      console.error('Create business error:', error); // Debug için log
      return rejectWithValue(
        error.response?.data?.errors || 
        error.response?.data?.message || 
        error.message || 
        ['Business creation failed']
      );
    }
  }
);
/**
 * Async thunk for token refresh
 */
export const refreshUserToken = createAsyncThunk(
  'auth/refresh-token',
  async (_, { rejectWithValue }) => {
    try {
      const response = await refreshToken();
      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error.response?.data || error.message);
      return rejectWithValue('Authentication failed. Please log in again.');
    }
  }
);

/**
 * Async thunk for fetching current user data
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/current-user',
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
    id: tenantData.tenantId || tenantData.id,
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
        const userData = action.payload?.data || action.payload;
        if(userData) {
          state.user = formatUserData(userData);
          
          
          // Tenant bilgilerini kaydet
          if (userData.tenant) {
            state.tenant = userData.tenant;
          } else if (userData.tenantId) {
            state.tenant = { id: userData.tenantId, name: userData.tenantName || 'İşletme', subdomain: '' };
          }
          
          state.isAuthenticated = true;
          // İşletme kaydını doğru şekilde kontrol et
          state.isBusinessRegistered = !!(userData.tenantId || userData.tenant?.id);
          console.log('Login success, business registered:', state.isBusinessRegistered, 'tenantId:', userData.tenant?.id);
        }
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
          // Store user data and tokens in Redux state
          state.user = formatUserData(userData);

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
        const businessData = action.payload?.data || action.payload;
        if (businessData) {
          state.tenant = {
            id: businessData.id,
            name: businessData.name,
            subdomain: businessData.subdomain,
            ...businessData
          };
          // Don't try to extract tokens from response - they're in HTTP-only cookies
          // state.token = businessData.token ?? state.token; 
          // state.refreshToken = businessData.refreshToken ?? state.refreshToken;
          state.isBusinessRegistered = true;
          state.isAuthenticated = true; // Ensure we maintain authenticated state
        }
        state.loading = false;
      })
      .addCase(createBusinessForUser.rejected, (state, action) => {
        state.error = action.payload as string[] | string;
        state.loading = false;
        console.error('Business creation rejected:', action.payload); // Debug için log
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
        const userData = action.payload?.data || action.payload;
        console.log('Raw userData from API:', userData); // Debug amaçlı
        
        if (userData) {
          state.user = formatUserData(userData);
          
          // TenantId kontrolü - tüm olası property isimleri
          const tenantId = userData.tenantId || userData.tenant?.id || null;
          console.log('Extracted tenantId:', tenantId); // Debug amaçlı
          
          if (tenantId) {
            // Tenant bilgisi varsa kaydet
            state.tenant = {
              id: tenantId,
              name: userData.tenantName || userData.tenant?.name || 'İşletme',
              subdomain: userData.tenant?.subdomain || ''
            };
            state.isBusinessRegistered = true;
          } else {
            state.tenant = null;
            state.isBusinessRegistered = false;
          }
          
          state.isAuthenticated = true;
          console.log('Current user state updated:', {
            isAuthenticated: state.isAuthenticated,
            isBusinessRegistered: state.isBusinessRegistered,
            tenantId: state.tenant?.id
          });
        } else {
          state.isAuthenticated = false;
          state.isBusinessRegistered = false;
          state.user = null;
          state.tenant = null;
        }
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        console.log('fetchCurrentUser rejected:', action.error.message);
        // Kullanıcı oturum açmadığında tüm state'i temizle
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
        state.isBusinessRegistered = false;
        state.loading = false;
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        // Clear all auth data including tokens
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