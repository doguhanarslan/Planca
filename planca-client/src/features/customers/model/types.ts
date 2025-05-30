import { CustomerDto } from '@/shared/types';

// Re-export shared customer type
export type { CustomerDto } from '@/shared/types';

// Customer form data types
export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  notes?: string;
}

// Customer list props
export interface CustomersListProps {
  onSelectCustomer: (customerId: string) => void;
  onAddCustomer: () => void;
  onEditCustomer?: (customerId: string) => void;
  onDeleteCustomer?: (customerId: string) => void;
  isDetailViewActive?: boolean;
  selectedCustomerId?: string | null;
}

// Customer detail props
export interface CustomerDetailProps {
  onCreateAppointment: (customerId: string) => void;
  onClose: () => void;
  onEditCustomer?: (customerId: string) => void;
  onDeleteCustomer?: (customerId: string) => void;
}

// Customer form props
export interface CustomerFormProps {
  customerId?: string; // For edit mode
  onSuccess?: (customer: CustomerDto) => void;
  onCancel?: () => void;
  isEditMode?: boolean;
}

// Customer stats for dashboard
export interface CustomerStats {
  total: number;
  growth: string;
  activeToday: number;
  avgRating: number;
}

// Filter options
export interface CustomerFilterOptions {
  pageNumber: number;
  pageSize: number;
  searchString?: string;
  sortBy: string;
  sortAscending: boolean;
}

// Modal states
export interface CustomerModalState {
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  customerToEdit: string | null;
  customerToDelete: string | null;
}

export type CustomerTab = 'info' | 'appointments' | 'history';

export type CustomerSortField = 'firstName' | 'lastName' | 'email' | 'createdAt'; 