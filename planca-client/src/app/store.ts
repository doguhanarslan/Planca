// src/app/store.ts
import { configureStore, Reducer, AnyAction, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/features/auth/authSlice';
import customersReducer, { resetCustomers } from '@/features/customers/customersSlice';
import appointmentsReducer, { clearAppointments } from '@/features/appointments/appointmentsSlice';
import { initializeAxios } from '@/shared/api/base/axios';

// Import RTK Query APIs
import { baseApi } from '@/shared/api/base/baseApi';

// Note: employeesReducer removed - now using RTK Query
// Note: servicesReducer removed - now using RTK Query

// Combine base reducers
const appReducer = combineReducers({
  auth: authReducer,
  customers: customersReducer,
  appointments: appointmentsReducer,
  // Add RTK Query reducer
  [baseApi.reducerPath]: baseApi.reducer,
});

// Root reducer with state reset logic
const rootReducer: Reducer = (state: RootState | undefined, action: AnyAction) => {
  // Reset state on auth changes or tenant changes
  if (
    action.type === 'auth/loginUser/fulfilled' || 
    action.type === 'auth/logoutUser/fulfilled' ||
    action.type === 'auth/refreshUserToken/fulfilled' ||
    action.type === 'auth/fetchCurrentUser/fulfilled'
  ) {
    // Compare tenant IDs
    const previousTenantId = state?.auth?.tenant?.id;
    const nextState = appReducer(state, action);
    const currentTenantId = nextState.auth?.tenant?.id;
    
    // If tenant changed, reset relevant state
    if (previousTenantId !== currentTenantId) {
      console.log(`Tenant change detected: ${previousTenantId} -> ${currentTenantId}`);
      
      return {
        ...nextState,
        customers: customersReducer(undefined, resetCustomers()),
        appointments: appointmentsReducer(undefined, clearAppointments()),
        // Reset RTK Query cache for tenant-specific data
        [baseApi.reducerPath]: baseApi.reducer(undefined, baseApi.util.resetApiState()),
      };
    }
    
    return nextState;
  }

  // Handle logout - reset RTK Query cache
  if (action.type === 'auth/logoutUser/fulfilled') {
    const nextState = appReducer(state, action);
    return {
      ...nextState,
      [baseApi.reducerPath]: baseApi.reducer(undefined, baseApi.util.resetApiState()),
    };
  }

  return appReducer(state, action);
};

// Configure store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types and field paths for RTK Query
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['api.mutations', 'api.queries'],
      },
    })
    // Add RTK Query middleware
    .concat(baseApi.middleware),
});

// Setup listeners for RTK Query (enables automatic refetching)
setupListeners(store.dispatch);

// Initialize axios with the store (for non-RTK Query requests)
initializeAxios(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;