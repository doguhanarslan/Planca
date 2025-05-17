import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import AppointmentsAPI from './appointmentsAPI';
import { AppointmentDto } from '../../types';

// Define the appointments state
interface AppointmentsState {
  appointments: AppointmentDto[];
  selectedAppointment: AppointmentDto | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  calendarDate: string; // ISO string of the currently selected date in calendar
  lastFetchParams?: {
    startDate: string;
    endDate: string;
  };
}

// Initial state
const initialState: AppointmentsState = {
  appointments: [],
  selectedAppointment: null,
  status: 'idle',
  error: null,
  calendarDate: new Date().toISOString(),
  lastFetchParams: undefined
};

// Async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (params: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    customerId?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const tenantId = state.auth.tenant?.id;
      
      // Skip fetch if we're requesting the same date range we already have
      const currentState = state.appointments;
      if (
        currentState.lastFetchParams && 
        params.startDate === currentState.lastFetchParams.startDate && 
        params.endDate === currentState.lastFetchParams.endDate &&
        currentState.appointments.length > 0 &&
        currentState.status === 'succeeded'
      ) {
        // Return existing data to avoid unnecessary fetch
        return currentState.appointments;
      }
      
      const response = await AppointmentsAPI.getAppointments({
        ...params,
        tenantId
      });
      
      // Log the full response structure
      console.log('API Response in thunk:', response);
      
      // API returns { items: AppointmentDto[], pageNumber, totalPages, etc. }
      // We need to extract and return the items array
      if (response && response.items && Array.isArray(response.items)) {
        console.log('Found items array with length:', response.items.length);
        return response.items;
      } else {
        console.warn('API response does not contain items array:', response);
        return [];
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch appointments');
    }
  }
);

export const fetchEmployeeAppointments = createAsyncThunk(
  'appointments/fetchEmployeeAppointments',
  async ({ employeeId, startDate, endDate }: {
    employeeId: string;
    startDate: string;
    endDate: string;
  }, { rejectWithValue }) => {
    try {
      const appointments = await AppointmentsAPI.getEmployeeAppointments(
        employeeId,
        startDate,
        endDate
      );
      
      return appointments;
    } catch (error) {
      return rejectWithValue('Failed to fetch employee appointments');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: {
    customerId: string;
    employeeId: string;
    serviceId: string;
    startTime: string;
    notes?: string;
  }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const tenantId = state.auth.tenant?.id;
      
      const response = await AppointmentsAPI.createAppointment({
        ...appointmentData,
        tenantId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to create appointment');
    }
  }
);

export const fetchCustomerAppointments = createAsyncThunk(
  'appointments/fetchCustomerAppointments',
  async ({ customerId, startDate, endDate }: {
    customerId: string;
    startDate?: string;
    endDate?: string;
  }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const tenantId = state.auth.tenant?.id;
      
      console.log('Fetching customer appointments:', { customerId, startDate, endDate, tenantId });
      
      const appointments = await AppointmentsAPI.getCustomerAppointments(
        customerId,
        startDate,
        endDate,
        tenantId
      );
      
      return appointments;
    } catch (error) {
      console.error('Failed to fetch customer appointments:', error);
      return rejectWithValue('Failed to fetch customer appointments');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async (appointmentData: {
    id: string;
    customerId: string;
    employeeId: string;
    serviceId: string;
    startTime: string;
    notes?: string;
  }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const tenantId = state.auth.tenant?.id;
      
      const response = await AppointmentsAPI.updateAppointment(
        appointmentData.id, 
        { 
          customerId: appointmentData.customerId,
          employeeId: appointmentData.employeeId,
          serviceId: appointmentData.serviceId,
          startTime: appointmentData.startTime,
          notes: appointmentData.notes,
          tenantId 
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to update appointment');
    }
  }
);

// Create the appointments slice
const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setSelectedAppointment: (state, action: PayloadAction<AppointmentDto | null>) => {
      state.selectedAppointment = action.payload;
    },
    setCalendarDate: (state, action: PayloadAction<string>) => {
      state.calendarDate = action.payload;
      // Don't trigger any additional fetches here, component will handle it
    },
    clearAppointments: (state) => {
      state.appointments = [];
      state.status = 'idle';
      state.error = null;
      state.lastFetchParams = undefined;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAppointments
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
        // Don't clear previous appointments while loading to prevent flickering
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Debug logs for API response
        console.log('fetchAppointments.fulfilled - Raw payload:', action.payload);
        
        // Only update if we got new data
        if (action.payload) {
          // Check if the payload is directly an array
          if (Array.isArray(action.payload)) {
            console.log('Direct array payload with length:', action.payload.length);
            state.appointments = action.payload;
          } 
          else {
            console.warn('Unexpected payload format (should be an array):', action.payload);
            // Set empty array as fallback
            state.appointments = [];
          }
          
          // Store the fetch parameters to avoid duplicate fetches
          if (action.meta.arg.startDate && action.meta.arg.endDate) {
            state.lastFetchParams = {
              startDate: action.meta.arg.startDate,
              endDate: action.meta.arg.endDate
            };
          }
        } else {
          console.warn('Empty payload received from API');
          state.appointments = [];
        }
        
        console.log('State after update:', {
          appointmentsLength: state.appointments.length,
          status: state.status,
          sampleAppointment: state.appointments.length > 0 ? state.appointments[0] : null
        });
        
        state.error = null;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        // Don't clear appointments on error to keep showing previous data
      })
      
      // Handle fetchEmployeeAppointments
      .addCase(fetchEmployeeAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployeeAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle createAppointment
      .addCase(createAppointment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.appointments.push(action.payload);
          state.selectedAppointment = action.payload;
        }
        state.error = null;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle fetchCustomerAppointments
      .addCase(fetchCustomerAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomerAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomerAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle updateAppointment
      .addCase(updateAppointment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          const index = state.appointments.findIndex(a => a.id === action.payload.id);
          if (index !== -1) {
            state.appointments[index] = action.payload;
            state.selectedAppointment = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { setSelectedAppointment, setCalendarDate, clearAppointments } = appointmentsSlice.actions;

// Export selectors
export const selectAppointments = (state: RootState) => state.appointments.appointments;
export const selectSelectedAppointment = (state: RootState) => state.appointments.selectedAppointment;
export const selectAppointmentsStatus = (state: RootState) => state.appointments.status;
export const selectAppointmentsError = (state: RootState) => state.appointments.error;
export const selectCalendarDate = (state: RootState) => state.appointments.calendarDate;

// Export reducer
export default appointmentsSlice.reducer; 