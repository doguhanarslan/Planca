import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { initializeAxios } from '../utils/axios';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types as they might contain non-serializable data
        ignoredActions: ['auth/refreshToken/fulfilled', 'auth/refreshToken/rejected'],
      },
    }),
});

// Initialize axios with the store
initializeAxios(store);

export default store;