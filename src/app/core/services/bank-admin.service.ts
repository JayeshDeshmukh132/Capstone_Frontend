// src/app/features/bank-admin/services/bank-admin.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DocumentStatus, Organization, OrganizationStatus, Page ,OrganizationDocument, BankAccountListItem, BankAccountDetail, BankAccountStatus, PaymentType, DepositRequest, PaymentRequest, RequestStatus} from '../model/model';
import { NotificationStatus, Notification as ApiNotification } from '../model/model';
import { environment } from '../../../environments/environment';

// NOTE: Replace with your actual API base URL
const API_BASE_URL = `${environment.apiUrl}/admin/bank`;

@Injectable({
  providedIn: 'root',
})
export class BankAdminService {
  private readonly http = inject(HttpClient);

  // === Organization Management ===

  getOrganizations(page: number, size: number): Observable<Page<Organization>> {
    console.log('STEP 2: BankAdminService is making the API call now.');
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Organization>>(`${API_BASE_URL}/organizations`, { params });
  }

  getOrganizationById(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${API_BASE_URL}/organizations/${id}`);
  }

  createOrganization(data: { name: string; email: string }): Observable<Organization> {
    return this.http.post<Organization>(`${API_BASE_URL}/organizations`, data);
  }
  
  updateOrganizationStatus(
    id: number, 
    status: OrganizationStatus, 
    note: string
  ): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/organizations/${id}/status`, { status, note });
  }

  getDocumentsForOrganization(organizationId: number): Observable<OrganizationDocument[]> {
    return this.http.get<OrganizationDocument[]>(`${API_BASE_URL}/organizations/${organizationId}/documents`);
  }

  updateDocumentStatus(documentId: number, status: DocumentStatus, note: string): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/organizations/document/${documentId}`, { status, note });
  }

  // === Notification Management ===

  getNotifications(page: number, size: number): Observable<Page<ApiNotification>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ApiNotification>>(`${API_BASE_URL}/notifications`, { params });
  }

  markNotificationAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/notifications/${id}/read`, {});
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/notifications/${id}`);
  }

  markAllNotificationsAsRead(): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/notifications/read`, {});
  }

  deleteAllReadNotifications(): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/notifications/read`);
  }

  // === Password Management ===
  
  changePassword(data: { oldPassword: string, newPassword: string }): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/change-password`, data);
  }

  // ## Bank Account Methods ##

  getBankAccountsForOrganization(orgId: number): Observable<BankAccountListItem[]> {
    return this.http.get<BankAccountListItem[]>(`${API_BASE_URL}/${orgId}/bank-accounts`);
  }

  getBankAccountById(orgId: number, accountId: number): Observable<BankAccountDetail> {
    return this.http.get<BankAccountDetail>(`${API_BASE_URL}/${orgId}/bank-accounts/${accountId}`);
  }

  updateBankAccountStatus(accountId: number, status: BankAccountStatus, note: string): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/bank-accounts/${accountId}/status`, { status, note });
  }

  // ## Payment & Deposit Request Methods ##

   getPendingPaymentRequests(
    orgId: number,
    filter: PaymentType | 'ALL',
    page: number,
    size: number
  ): Observable<Page<PaymentRequest>> {

    // 1. Start with the base URL
    let url = `${API_BASE_URL}/payment-requests/${orgId}/payment-requests`;

    // 2. Append the correct path based on the filter
    //    IMPORTANT: Replace these paths with your actual endpoint paths!
    switch (filter) {
      case 'SALARY':
        url += '/pending/salary'; // Example: '.../pending/salary'
        break;
      case 'VENDOR':
        url += '/pending/vendor'; // Example: '.../pending/deposit'
        break;
      // Add other cases for other PaymentType values if you have them
      
      default: // This will handle the 'ALL' case
        url += '/pending';
        break;
    }

    // 3. Add pagination parameters to the request
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // 4. Make the HTTP GET request with the correct URL and params
    return this.http.get<Page<PaymentRequest>>(url, { params });
  }

  /**
   * ✅ FIXED: This method now correctly adds pagination parameters.
   */
  getPendingDepositRequests(orgId: number, page: number, size: number): Observable<Page<DepositRequest>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    const url = `${API_BASE_URL}/payment-requests/${orgId}/deposit-requests/pending`;
    // Pass the params object with the GET request
    return this.http.get<Page<DepositRequest>>(url, { params });
  }

   updatePaymentRequestStatus(requestId: number, status: RequestStatus, note: string): Observable<void> {
    // NOTE: Adjust this URL to match your actual backend endpoint
    return this.http.put<void>(`${API_BASE_URL}/payment-requests/payment-requests/${requestId}/status`, { status, note });
  }

  updateDepositRequestStatus(requestId: number, status: RequestStatus, note: string): Observable<void> {
    // NOTE: Adjust this URL to match your actual backend endpoint
    return this.http.put<void>(`${API_BASE_URL}/payment-requests/deposit-requests/${requestId}/status`, { status, note });
  }
}