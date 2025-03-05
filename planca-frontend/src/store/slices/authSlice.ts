import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  AuthState, 
  RegisterRequest, 
  LoginRequest, 
  CreateBusinessRequest,
  AuthResponse, 
  TenantData,
  ApiResponse 
} from '@/types';
import apiClient from '@/lib/api/api';
import { setCookie, removeCookie } from 'cookies-next';

const initialState: AuthState = {
  userData: null,
  businessData: null,
  isAuthenticated: false,
  registrationStep: 1,
  loading: false,
  error: null
};

// Async Actions
export const registerUser = createAsyncThunk
  AuthResponse,
  RegisterRequest,
  { rejectValue: string }
>('user/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    
    if (!response.succeeded) {
      return rejectWithValue(response.errors?.join(', ') || 'Registration failed');
    }
    
    // Store tokens in cookies
    setCookie('auth_token', response.data.token);
    setCookie('refresh_token', response.data.refreshToken);
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('An unknown error occurred');
  }
});

export const loginUser = createAsyncThunk
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>('user/login', async (loginData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', loginData);
    
    if (!response.succeeded) {
      return rejectWithValue(response.errors?.join(', ') || 'Login failed');
    }
    
    // Store tokens in cookies
    setCookie('auth_token', response.data.token);
    setCookie('refresh_token', response.data.refreshToken);
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('An unknown error occurred');
  }
});

export const createBusiness = createAsyncThunk
  TenantData,
  CreateBusinessRequest,
  { rejectValue: string }
>('user/createBusiness', async (businessData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<TenantData>('/auth/create-business', businessData);
    
    if (!response.succeeded) {
      return rejectWithValue(response.errors?.join(', ') || 'Failed to create business');
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('An unknown error occurred');
  }
});

export const getCurrentUser = createAsyncThunk
  AuthResponse,
  void,
  { rejectValue: string }
>('user/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<AuthResponse>('/auth/current-user');
    
    if (!response.succeeded) {
      return rejectWithValue(response.errors?.join(', ') || 'Failed to get current user');
    }
    
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('An unknown error occurred');
  }
});

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setRegistrationStep(state, action: PayloadAction<number>) {
      state.registrationStep = action.payload;
    },
    logout(state) {
      state.userData = null;
      state.businessData = null;
      state.isAuthenticated = false;
      state.registrationStep = 1;
      removeCookie('auth_token');
      removeCookie('refresh_token');
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.isAuthenticated = true;
        state.registrationStep = 2;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed';
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed';
      })
      
      // Create Business
      .addCase(createBusiness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBusiness.fulfilled, (state, action) => {
        state.loading = false;
        state.businessData = action.payload;
        state.registrationStep = 0; // Registration completed
      })
      .addCase(createBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create business';
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to get user';
      });
  }
});

export const { setRegistrationStep, logout } = userSlice.actions;
export default userSlice.reducer;