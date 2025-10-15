/**
 * Represents the response from a synchronous bulk CSV upload.
 * Matches the backend's BulkUploadResponse DTO.
 */
export interface BulkUploadResponse {
  successfulRecords: number;
  failedRecords: number;
  errorDetails: string[]; // A list of messages detailing why specific rows failed
}