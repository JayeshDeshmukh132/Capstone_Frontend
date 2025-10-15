export interface DocumentResponse {
  id: number;
  storedPath?: string;    
  displayName?: string;  
  originalName?: string; 
  organizationId?: number;
  contentType?: string;
  [k: string]: unknown;
}