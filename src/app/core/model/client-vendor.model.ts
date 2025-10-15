import { Page } from './model'; // Import the generic Page interface

/**
 * Enum to represent the type of the entity, matching the backend.
 */
export enum ClientVendorType {
  CLIENT = 'CLIENT',
  VENDOR = 'VENDOR',
}

export interface ClientVendorCreateRequest {
  name: string;
  type: ClientVendorType;
  contactPhone: string;
  accountNo: string;
  ifscCode: string;
  contactEmail: string;
}


export interface ClientVendorSummary {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone: string;
  accountNumber: string;
}


export interface ClientVendor extends ClientVendorSummary {
  type: ClientVendorType;
  ifscCode: string;
}


export type ClientVendorPage = Page<ClientVendorSummary>;