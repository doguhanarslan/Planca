// features/booking/model/types.ts

// Business Information
export interface BusinessInfo {
    id: string;
    businessName: string;
    description: string;
    address: string;
    phoneNumber: string;
    email: string;
    website?: string;
    workingHours: string;
  }
  
  // Service from public API
  export interface PublicServiceDto {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number; // in minutes
    isActive: boolean;
  }
  
  // Employee from public API
  export interface PublicEmployeeDto {
    id: string;
    firstName: string;
    lastName: string;
    title?: string;
    isActive: boolean;
  }
  
  // Time slot availability
  export interface TimeSlot {
    startTime: string; // ISO string
    endTime: string; // ISO string
    isAvailable: boolean;
    formattedTime: string; // "HH:mm" format
  }
  
  // Guest appointment creation request
  export interface CreateGuestAppointmentRequest {
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    guestPhoneNumber: string;
    customerMessage?: string;
    serviceId: string;
    employeeId: string;
    startTime: string; // ISO string
    notes?: string;
  }
  
  // Response from appointment creation
  export interface AppointmentRequestResponse {
    success: boolean;
    message: string;
    appointmentId?: string;
    confirmationCode?: string;
  }
  
  // Form data for booking flow
  export interface BookingFormData {
    // Customer information
    guestFirstName: string;
    guestLastName: string;
    guestEmail: string;
    guestPhoneNumber: string;
    customerMessage: string;
    
    // Appointment selection
    serviceId: string;
    employeeId: string;
    appointmentDate: Date | null;
    appointmentTime: string; // "HH:mm" format
    notes: string;
  }
  
  // Booking step configuration
  export interface BookingStep {
    id: 'service' | 'employee' | 'datetime' | 'customer' | 'confirmation';
    title: string;
    description?: string;
    completed: boolean;
    active: boolean;
    enabled: boolean;
  }
  
  // Form validation errors
  export interface BookingFormErrors {
    guestFirstName?: string;
    guestLastName?: string;
    guestEmail?: string;
    guestPhoneNumber?: string;
    customerMessage?: string;
    serviceId?: string;
    employeeId?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    notes?: string;
    general?: string;
  }
  
  // Available time slots query params
  export interface TimeSlotQuery {
    tenantSlug: string;
    employeeId: string;
    serviceId: string;
    date: string; // YYYY-MM-DD format
  }
  
  // Business employees query params
  export interface BusinessEmployeesQuery {
    tenantSlug: string;
    serviceId?: string;
  }
  
  // Appointment status query (for tracking)
  export interface AppointmentStatusQuery {
    confirmationCode: string;
    email: string;
  }
  
  // Appointment status response
  export interface AppointmentStatus {
    id: string;
    status: 'Pending' | 'Confirmed' | 'Rejected' | 'Canceled';
    customerName: string;
    serviceName: string;
    employeeName: string;
    startTime: string;
    endTime: string;
    notes?: string;
    customerMessage?: string;
  }
  
  // Booking success data for display
  export interface BookingSuccessData {
    appointmentId: string;
    confirmationCode: string;
    businessName: string;
    customerName: string;
    serviceName: string;
    employeeName: string;
    appointmentDate: string;
    appointmentTime: string;
    customerEmail: string;
    message: string;
  }
  
  // Error response structure
  export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: string[];
    statusCode?: number;
    timestamp?: string;
  }
  
  // Success response wrapper
  export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
  }
  
  // Generic API response
  export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
  
  // Booking validation rules
  export interface BookingValidationRules {
    firstName: {
      required: boolean;
      minLength: number;
      maxLength: number;
      pattern?: RegExp;
    };
    lastName: {
      required: boolean;
      minLength: number;
      maxLength: number;
      pattern?: RegExp;
    };
    email: {
      required: boolean;
      pattern: RegExp;
      maxLength: number;
    };
    phone: {
      required: boolean;
      pattern: RegExp;
      minLength: number;
      maxLength: number;
    };
    message: {
      maxLength: number;
    };
  }
  
  // Default validation rules
  export const BOOKING_VALIDATION_RULES: BookingValidationRules = {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-ZıİğĞüÜşŞöÖçÇ\s]+$/
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-ZıİğĞüÜşŞöÖçÇ\s]+$/
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 255
    },
    phone: {
      required: true,
      pattern: /^[\d\s\+\-\(\)]+$/,
      minLength: 10,
      maxLength: 20
    },
    message: {
      maxLength: 1000
    }
  };
  
  // Time slot generation helpers
  export interface TimeSlotSettings {
    startHour: number; // 9 for 09:00
    endHour: number; // 17 for 17:00
    slotDuration: number; // 30 minutes
    breakHours?: number[]; // lunch break hours [12, 13]
  }
  
  // Default time slot settings
  export const DEFAULT_TIME_SLOT_SETTINGS: TimeSlotSettings = {
    startHour: 9,
    endHour: 17,
    slotDuration: 30,
    breakHours: [12, 13]
  };