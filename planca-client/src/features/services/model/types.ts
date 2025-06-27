import { ServiceDto } from '@/shared/types';

// Re-export shared service type
export type { ServiceDto } from '@/shared/types';

// Service form data types
export interface ServiceFormData {
  name: string;
  description?: string;
  color: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

// Service list props
export interface ServicesListProps {
  onSelectService?: (serviceId: string) => void;
  onAddService?: () => void;
  onEditService?: (serviceId: string) => void;
  onDeleteService?: (serviceId: string) => void;
  isDetailViewActive?: boolean;
  selectedServiceId?: string | null;
}

// Service detail props
export interface ServiceDetailProps {
  serviceId: string;
  onClose: () => void;
  onEditService?: (serviceId: string) => void;
  onDeleteService?: (serviceId: string) => void;
}

// Service form props
export interface ServiceFormProps {
  serviceId?: string; // For edit mode
  onSuccess?: (service: ServiceDto) => void;
  onCancel?: () => void;
  isEditMode?: boolean;
}

// Service stats for dashboard
export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  avgPrice: number;
  totalRevenue: number;
}

// Filter options
export interface ServiceFilterOptions {
  pageNumber: number;
  pageSize: number;
  searchString?: string;
  isActive?: boolean;
  maxPrice?: number;
  sortBy: string;
  sortAscending: boolean;
}

// Modal states
export interface ServiceModalState {
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  serviceToEdit: string | null;
  serviceToDelete: string | null;
}

export type ServiceTab = 'info' | 'pricing' | 'employees' | 'statistics';

export type ServiceSortField = 'name' | 'price' | 'durationMinutes' | 'isActive' | 'createdAt';

// Service colors for UI
export interface ServiceColorOption {
  value: string;
  label: string;
  hex: string;
} 