// Generic wrapper for paginated responses
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page number
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Enum for statuses 
export enum OrganizationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
}

export enum BankAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum NotificationStatus {
  READ = 'READ',
  UNREAD = 'UNREAD',
}

// Main Interfaces
export interface Organization {
  id: number;
  name: string;
  registrationNo: string;
  address: string;
  email: string;
  status: OrganizationStatus;
  verificationDocsUrl: string; // Assuming this might be an array in reality
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: number;
  organizationId: number;
  organizationName: string;
  bankAccountNumber: string;
  ifscCode: string;
  branchName: string;
  bankStatus: BankAccountStatus;
  balance: number;
  docsUrl: string;
  note: string;
}

export interface Notification {
  id: number;
  message: string;
  status: NotificationStatus;
  createdAt: string;
}

export interface JobLaunchResponse {
  jobExecutionId: number;
  message: string;
}

export interface FailedRecordInfo {
  lineNumber: number;
  firstName: string;
  lastName?: string;
  email?: string;
  reason: string;
}

export interface JobCompletionResponse {
  jobExecutionId: number;
  status: 'COMPLETED' | 'STARTING' | 'STARTED' | 'STOPPING' | 'STOPPED' | 'FAILED' | 'ABANDONED' | 'UNKNOWN';
  // --- FIX: Remove the optional '?' markers ---
  // The backend always sends these values, so they should not be optional.
  totalRecordsProcessed: number;
  successfulRecords: number;
  failedRecords: number; // The count
  failedRecordDetails: FailedRecordInfo[]; // The array of details
}