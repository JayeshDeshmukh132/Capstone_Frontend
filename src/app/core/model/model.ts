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

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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

export interface OrganizationDocument {
  id: number;
  organizationId: number;
  storedPath: string;
  displayName: string;
  originalFilename: string;
  uploadedAt: string;
  note: string;
  status: DocumentStatus;
}