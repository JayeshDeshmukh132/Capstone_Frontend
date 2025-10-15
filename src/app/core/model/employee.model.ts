import { Page } from "./model";

export interface EmployeeCreateRequest {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  department: string;
  accountNumber: string;
  ifscCode: string;
  joiningDate: string; // Expected format: YYYY-MM-DD
}


export interface EmployeeResponse {
  id: string; 
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  department: string;
  accountNumber: string;
  ifscCode: string;
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface EmployeeSummary {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
}



export interface EmployeeUpdateRequest {
  employeeId?: string | null; // Optional: only send if changed
  email?: string | null;      // Optional: only send if changed
  firstName: string | null;
  lastName: string | null;
  designation: string | null;
  department: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  joiningDate: string | null;
}




export interface JobLaunchResponse {
  jobExecutionId: number;
  message: string;
}

export interface FailedRecordInfo {
  lineNumber: number; 
  firstName: string;
  lastName: string;
  email: string;
  reason: string;
}

export interface JobCompletionResponse {
  jobExecutionId: number;
  status: 'COMPLETED' | 'STARTING' | 'STARTED' | 'STOPPING' | 'STOPPED' | 'FAILED' | 'ABANDONED' | 'UNKNOWN';
  totalRecordsProcessed: number;
  successfulRecords: number;
  failedRecords: number;
  failedRecordDetails: FailedRecordInfo[];
}
export type EmployeePage = Page<EmployeeSummary>;