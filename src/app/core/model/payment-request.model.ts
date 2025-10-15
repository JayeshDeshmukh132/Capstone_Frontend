import { Page } from './model';


export enum PaymentType {
  DEPOSIT = 'DEPOSIT',
  VENDOR = 'VENDOR',
  SALARY = 'SALARY',
}


export interface PaymentRequestCreate {
  amount: number;
  paymentType: PaymentType;
  bankAccountId: number;
  note: string; 
  clientVendorId?: number | null;
}

export interface PaymentRequestSummary {
  id: number;
  amount: number;
  status: string; 
  paymentType: PaymentType;
  createdAt: string; 
}

export interface PaymentRequestDetails {
  id: number;
  organizationId: number;
  organizationName: string;
  amount: number;
  paymentType: PaymentType;
  status: string; // e.g., 'PENDING', 'APPROVED', 'REJECTED'
  bankAccountId: number;
  approvedByAdminId: number | null; // Can be null if not yet approved
  approvedByAdminName: string | null; // Can be null if not yet approved
  note: string | null;
  proofDocUrl: string | null;
  createdAt: string; 
  clientVendorId: number | null; // Can be null for deposits/salaries
}

export type PaymentRequestPage = Page<PaymentRequestSummary>;


export interface PaymentRequest extends PaymentRequestSummary {
  description: string;
}

