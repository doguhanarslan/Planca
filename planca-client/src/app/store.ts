export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import servicesReducer from '@/features/services/servicesSlice';
import { initializeAxios } from '@/utils/axios';

const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    // Add other reducers here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types as they might contain non-serializable data
        
      },
    }),
});

// Initialize axios with the store
initializeAxios(store);

// Redux TypeScript types

export default store;