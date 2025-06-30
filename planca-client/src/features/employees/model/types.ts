import { EmployeeDto } from '@/shared/types';

// Re-export shared employee type
export type { EmployeeDto } from '@/shared/types';

// Employee form data types
export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  title?: string;
  isActive: boolean;
  serviceIds: string[];
  workingHours: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorkingDay: boolean;
  }[];
}

// Employee list props
export interface EmployeesListProps {
  onSelectEmployee?: (employeeId: string) => void;
  onAddEmployee: () => void;
  onEditEmployee?: (employeeId: string, employeeData?: EmployeeDto) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  isDetailViewActive?: boolean;
  selectedEmployeeId?: string | null;
}

// Employee detail props
export interface EmployeeDetailProps {
  onCreateAppointment?: (employeeId: string) => void;
  onClose: () => void;
  onEditEmployee?: (employeeId: string) => void;
  onDeleteEmployee?: (employeeId: string) => void;
}

// Employee form props
export interface EmployeeFormProps {
  employeeId?: string; // For edit mode
  onSuccess?: (employee: EmployeeDto) => void;
  onCancel?: () => void;
  isEditMode?: boolean;
}

// Employee stats for dashboard
export interface EmployeeStats {
  total: number;
  active: number;
  avgWorkingDays: number;
  servicesCount: number;
}

// Filter options
export interface EmployeeFilterOptions {
  pageNumber: number;
  pageSize: number;
  searchString?: string;
  isActive?: boolean;
  sortBy: string;
  sortAscending: boolean;
}

// Modal states
export interface EmployeeModalState {
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  employeeToEdit: string | null;
  employeeToDelete: string | null;
}

export type EmployeeTab = 'info' | 'workingHours' | 'services' | 'permissions';

export type EmployeeSortField = 'firstName' | 'lastName' | 'email' | 'title' | 'createdAt'; 