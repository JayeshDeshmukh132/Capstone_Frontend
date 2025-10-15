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

export enum PaymentType {
  SALARY = 'SALARY',
  VENDOR = 'VENDOR',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface BankAccountDocument {
  id: number;
  displayName: string;
  storedPath: string;
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

// For the list view
export interface BankAccountListItem {
  id: number;
  organizationName: string;
  bankAccountNumber: string;
  branchName: string;
  bankStatus: BankAccountStatus;
}

// For the detailed view
export interface BankAccountDetail {
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
  documents: BankAccountDocument[];
}

export interface PaymentRequest {
  id: number;
  organizationName: string;
  amount: number;
  paymentType: PaymentType;
  status: RequestStatus;
  proofDocUrl: string;
  createdAt: string;
}

export interface DepositRequest {
  id: number;
  organizationName: string;
  amount: number;
  paymentType: PaymentType; // Following your API response structure
  status: RequestStatus;
  proofDocUrl: string;
  createdAt: string;
}

// For the salary history list
export interface SalaryHistoryItem {
  id: number;
  month: number;
  year: number;
  grossAmount: number;
  netAmount: number;
}

// For the detailed salary slip view
export interface SalarySlipDetail {
  id: number;
  employeeFirstName: string;
  employeeLastName: string;
  employeeDesignation: string;
  ifscCode: string;
  bankAccountNo: string;
  department: string;
  employeeCode: string;
  organizationName: string;
  basic: number;
  da: number;
  grossAmount: number;
  hra: number;
  netAmount: number;
  otherAllowances: number;
  pf: number;
  reimbursements: number;
  tds: number;
  month: number;
  year: number;
  ptax: number;
}