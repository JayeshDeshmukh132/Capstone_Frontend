export interface BankAccountDocument {
  id: number;
  displayName?: string;
  storedPath?: string; // The direct URL to view/download the document
  // Add any other fields from your DocumentResponse DTO
}
export interface BankAccountCreateRequest {
  accountNo: string;
  ifscCode: string;
  branchName: string;
  balance: number;
}


export interface BankAccountSummary {
  id: number;
  bankAccountNumber: string;
  bankStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  balance: number;
}

/**
 * Represents a document associated with a bank account.
 */


/**
 * Represents the full details of a bank account.
 * This should match the backend's BankAccountResponse DTO.
 */
export interface BankAccountDetails {
  id: number;
  organizationId: number;
  organizationName: string;
  bankAccountNumber: string;
  ifscCode: string;
  branchName: string;
  bankStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  balance: number;
  note: string;
  
}