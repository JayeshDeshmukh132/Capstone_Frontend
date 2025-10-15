export interface OrganizationResponse {
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

export enum OrganizationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE',
}

export interface OrganizationRegistrationCompleteResponse {
  registrationNo: string; // or perhaps the updated Organization object
  uploadErrors: { [key: string]: string }; // Map of document name to error message
  message?: string; // Optional general message
  // ... any other fields
}

export type Organization = OrganizationResponse