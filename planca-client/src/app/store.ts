export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore, Reducer, AnyAction, combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import servicesReducer from '@/features/services/servicesSlice';
import customersReducer, { resetCustomers } from '@/features/customers/customersSlice';
import employeesReducer, { resetFilters as resetEmployeesFilters } from '@/features/employees/employeesSlice';
import appointmentsReducer, { clearAppointments } from '@/features/appointments/appointmentsSlice';
import { initializeAxios } from '@/utils/axios';

// Temel reducer'ları combineReducers ile birleştiriyoruz
const appReducer = combineReducers({
  auth: authReducer,
  services: servicesReducer,
  customers: customersReducer,
  employees: employeesReducer,
  appointments: appointmentsReducer,
  // Diğer reducer'lar buraya eklenebilir
});

// Root reducer, auth state değişimlerini dinleyerek diğer state'leri temizleyebilir
const rootReducer: Reducer = (state: RootState | undefined, action: AnyAction) => {
  // Oturum açma/kapama durumlarında veya tenant değiştiğinde state'leri sıfırla
  if (
    action.type === 'auth/loginUser/fulfilled' || 
    action.type === 'auth/logoutUser/fulfilled' ||
    action.type === 'auth/refreshUserToken/fulfilled' ||
    action.type === 'auth/fetchCurrentUser/fulfilled'
  ) {
    // Mevcut ve önceki TenantId'leri karşılaştır
    const previousTenantId = state?.auth?.tenant?.id;
    const nextState = appReducer(state, action);
    const currentTenantId = nextState.auth?.tenant?.id;
    
    // Tenant değişimi veya oturum durumu değişimi varsa müşteri state'ini sıfırla
    if (previousTenantId !== currentTenantId) {
      console.log(`Tenant değişikliği algılandı: ${previousTenantId} -> ${currentTenantId}`);
      return {
        ...nextState,
        customers: customersReducer(undefined, resetCustomers()),
        employees: employeesReducer(undefined, resetEmployeesFilters()),
        appointments: appointmentsReducer(undefined, clearAppointments())
      };
    }
    
    return nextState;
  }

  // Diğer tüm durumlarda normal reducer'ı kullan
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types as they might contain non-serializable data
      },
    }),
});

// Initialize axios with the store
initializeAxios(store);

export default store;