import { createApi } from '@reduxjs/toolkit/query/react';
import { baseApi } from '@/shared/api/base/baseApi';
import type { 
  ApiResponse, 
  BusinessSettingsDto, 
  BookingSettingsDto, 
  NotificationSettingsDto,
  SettingsCategoryDto,
  SettingDto
} from '@/shared/types';

export const settingsAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all settings grouped by category
    getSettings: builder.query<ApiResponse<SettingsCategoryDto[]>, {
      category?: string;
      includeInactive?: boolean;
      includeSystemSettings?: boolean;
    }>({
      query: (params) => ({
        url: '/settings',
        params
      }),
      providesTags: ['Settings'],
    }),

    // Get business settings
    getBusinessSettings: builder.query<ApiResponse<BusinessSettingsDto>, void>({
      query: () => '/settings/business',
      providesTags: ['BusinessSettings'],
    }),

    // Get booking settings
    getBookingSettings: builder.query<ApiResponse<BookingSettingsDto>, void>({
      query: () => '/settings/booking',
      providesTags: ['BookingSettings'],
    }),

    // Get notification settings
    getNotificationSettings: builder.query<ApiResponse<NotificationSettingsDto>, void>({
      query: () => '/settings/notifications',
      providesTags: ['NotificationSettings'],
    }),

    // Update business settings
    updateBusinessSettings: builder.mutation<ApiResponse<SettingDto[]>, BusinessSettingsDto>({
      query: (businessSettings) => ({
        url: '/settings/business',
        method: 'PUT',
        body: businessSettings,
      }),
      invalidatesTags: ['BusinessSettings', 'Settings'],
    }),

    // Update booking settings
    updateBookingSettings: builder.mutation<ApiResponse<SettingDto[]>, BookingSettingsDto>({
      query: (bookingSettings) => ({
        url: '/settings/booking',
        method: 'PUT',
        body: bookingSettings,
      }),
      invalidatesTags: ['BookingSettings', 'Settings'],
    }),

    // Update notification settings
    updateNotificationSettings: builder.mutation<ApiResponse<SettingDto[]>, NotificationSettingsDto>({
      query: (notificationSettings) => ({
        url: '/settings/notifications',
        method: 'PUT',
        body: notificationSettings,
      }),
      invalidatesTags: ['NotificationSettings', 'Settings'],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useGetBusinessSettingsQuery,
  useGetBookingSettingsQuery,
  useGetNotificationSettingsQuery,
  useUpdateBusinessSettingsMutation,
  useUpdateBookingSettingsMutation,
  useUpdateNotificationSettingsMutation,
} = settingsAPI; 