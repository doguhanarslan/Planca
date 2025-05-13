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
      console.log('Action received data:', businessData); 
      if (!businessData) {
        throw new Error('Business data is required');
      }
      
      const response = await createBusiness(businessData);
      return response.data;
    } catch (error: any) {
      console.error('Create business error:', error); 
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
 * Async thunk for token refresh - İyileştirilmiş versiyonu
 * Boş body ile bile çalışacak şekilde tasarlandı
 */
export const refreshUserToken = createAsyncThunk(
  'Auth/refresh-token',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Token yenileme isteği gönderiliyor...');
      const response = await refreshToken();
      
      // Backend'den gelen refeshTokenExpiryTime'ı kullan
      console.log('Token yenileme başarılı:', response.data);
      console.log('RefreshToken sona erme tarihi:', response.data.data?.refreshTokenExpiryTime);
      
      return response.data;
    } catch (error: any) {
      console.error('Token yenileme hatası:', error.response?.data || error.message);
      // Token yenileme başarısız olduğunda cookie'leri temizleme
      return rejectWithValue('Kimlik doğrulama başarısız. Lütfen tekrar giriş yapın.');
    }
  }
);

/**
 * Async thunk for fetching current user data
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/current-user',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Current-user isteği yapılmadan önce token kontrolü yapma opsiyoneli
      // Bu sayede geçersiz JWT token durumunda bile current-user istek başarısı sağlanabilir
      try {
        // Check if token might be expired and try to refresh before fetching user
        const jwtCookie = document.cookie.split(';').find(c => c.trim().startsWith('jwt='));
        const refreshTokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('refreshToken='));
        
        // JWT token yok ama refresh token varsa, önce token yenileme yap
        if (!jwtCookie && refreshTokenCookie) {
          console.log('JWT token yok ama refresh token var, önce token yenilemeye çalışılıyor...');
          await dispatch(refreshUserToken()).unwrap();
        }
      } catch (refreshError) {
        console.log('Token yenileme hatası, current-user isteğine devam ediliyor:', refreshError);
        // Yenileme başarısız olsa bile current-user isteğine devam et
      }
      
      const response = await getCurrentUser();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Failed to fetch user data']);
    }
  }
);

/**
 * Async thunk for user logout - Cookie temizleme eklendi
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Diğer state'leri resetlemek için action'ları dispatch et
      // Bu dispatch, müşterilerle ilgili tüm state'i temizleyecek
      dispatch({ type: 'customers/resetCustomers' });
      
      // Logout API çağrısı
      await logout();
      
      return null;
    } catch (error: any) {
      // Hata olsa bile state'i temizlemeye çalış
      dispatch({ type: 'customers/resetCustomers' });
      
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
  refreshTokenExpiry: undefined
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
    },
    updateRefreshTokenExpiry: (state, action: PayloadAction<Date>) => {
      state.refreshTokenExpiry = action.payload;
      console.log('Redux store refreshTokenExpiry güncellendi:', action.payload);
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
          state.tenant = formatTenantData(userData);
          state.isAuthenticated = true;
          // İşletme kaydını doğru şekilde kontrol et
          state.isBusinessRegistered = !!(userData.tenantId || userData.tenant?.id);
          console.log('Login success, business registered:', state.isBusinessRegistered, 'tenantId:', userData.tenant?.id);
          // RefreshTokenExpiryTime değerini kaydet - sadece ilk kez
          if (userData.refreshTokenExpiryTime && !state.refreshTokenExpiry) {
            state.refreshTokenExpiry = new Date(userData.refreshTokenExpiryTime);
            console.log('Login: RefreshTokenExpiry ilk kez ayarlandı:', state.refreshTokenExpiry);
          }
        }
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
        state.isBusinessRegistered = false;
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
          state.isBusinessRegistered = true;
          state.isAuthenticated = true; // Ensure we maintain authenticated state
        }
        state.loading = false;
      })
      .addCase(createBusinessForUser.rejected, (state, action) => {
        state.error = action.payload as string[] | string;
        state.loading = false;
        console.error('Business creation rejected:', action.payload); 
      })
      
      // Refresh token cases - İyileştirildi
      .addCase(refreshUserToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        const userData = action.payload?.data || action.payload;
        if (userData) {
          state.user = formatUserData(userData);
          state.tenant = formatTenantData(userData);
          state.isAuthenticated = true;
          // İşletme kaydını doğru şekilde kontrol et
          state.isBusinessRegistered = !!(userData.tenantId || userData.tenant?.id);
          console.log('Login success, business registered:', state.isBusinessRegistered, 'tenantId:', userData.tenant?.id);
          // RefreshTokenExpiryTime değerini kaydet - mevcut değeri koruyoruz
          if (userData.refreshTokenExpiryTime && !state.refreshTokenExpiry) {
            state.refreshTokenExpiry = new Date(userData.refreshTokenExpiryTime);
            console.log('Redux store refreshTokenExpiry kaydedildi:', state.refreshTokenExpiry);
          } else if (userData.refreshTokenExpiryTime) {
            console.log('Mevcut RefreshTokenExpiry korunuyor:', state.refreshTokenExpiry);
          }
        }
        state.loading = false;
        state.error = null; // Hata varsa temizle
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        // When token refresh fails, log out the user but don't show error
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
        state.isBusinessRegistered = false;
        state.error = null; // Hata gösterme - sessizce fail
        state.loading = false;
        
        // Cookies temizlendi ve kullanıcı çıkış yaptırıldı bilgisi
        console.warn('Token yenileme başarısız oldu, kullanıcı çıkış yaptırıldı');
      })
      
      // Get current user cases - İyileştirildi
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        const userData = action.payload?.data || action.payload;
        console.log('API\'den gelen kullanıcı verisi:', userData);
        
        if (userData) {
          state.user = formatUserData(userData);
          
          // TenantId kontrolü - tüm olası property isimleri
          const tenantId = userData.tenantId || userData.tenant?.id || null;
          console.log('Çıkarılan tenantId:', tenantId);
          
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
          console.log('Current user durumu güncellendi:', {
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
        // Kullanıcı oturum açmadığında tüm state'i temizle ama hata gösterme
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
        state.isBusinessRegistered = false;
        state.error = null; // Hata mesajını gösterme - sessizce fail
        state.loading = false;
      })
      
      // Logout cases - İyileştirildi
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        // Clear all auth data including tokens
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
        state.isBusinessRegistered = false;
        state.error = null;
        state.loading = false;
        
        console.log('Kullanıcı başarıyla çıkış yaptı, cookies temizlendi');
      })
      .addCase(logoutUser.rejected, (state) => {
        // Hata olsa bile state'i temizle
        state.user = null;
        state.tenant = null;
        state.isAuthenticated = false;
        state.isBusinessRegistered = false;
        state.error = null;
        state.loading = false;
        
        console.warn('Çıkış yaparken bir hata oluştu, ancak state ve cookies temizlendi');
      });
  },
});

export const { clearError, resetAuthState, updateUserProfile, updateTenantInfo, updateRefreshTokenExpiry } = authSlice.actions;

export default authSlice.reducer;