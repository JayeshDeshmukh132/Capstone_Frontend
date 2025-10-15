import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization } from '../model/model';
import { environment } from '../../../environments/environment';
import { DocumentResponse } from '../model/document.model';
import { OrganizationRegistrationCompleteResponse } from '../model/organization.model';
import {
  EmployeeCreateRequest,
  EmployeePage,
  EmployeeResponse,
  EmployeeUpdateRequest,
  
} from '../model/employee.model';
import {
  BankAccountCreateRequest,
  BankAccountDetails,
  BankAccountSummary,
} from '../model/bank-account.model';
import {
  ClientVendor,
  ClientVendorCreateRequest,
  ClientVendorPage,
  ClientVendorType,
} from '../model/client-vendor.model';
import {
  PaymentRequestCreate,
  PaymentRequestDetails,
  PaymentRequestPage,
  PaymentType,
} from '../model/payment-request.model';

import {JobCompletionResponse,
  JobLaunchResponse} from '../model/model'
import { BulkUploadResponse } from '../model/bulk-upload.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/organization`;
  private salaryJobBase = `${environment.apiUrl}/jobs/salaries`;

  getOrganization(orgId: string | number): Observable<Organization> {
    // Changed to Organization
    return this.http.get<Organization>(`${this.base}/${orgId}`);
  }

  completeRegistration(
    orgId: string | number,
    formData: FormData
  ): Observable<OrganizationRegistrationCompleteResponse> {
    return this.http.put<OrganizationRegistrationCompleteResponse>(
      `${this.base}/${orgId}/complete-registration`,
      formData
    );
  }

  getDocuments(): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.base}/documents`);
  }

  getDocumentsForBankAccount(
    organizationId: string,
    accountId: number
  ): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(
      `${this.base}/${organizationId}/documents/bank/${accountId}`
    );
  }

  createEmployee(employeeData: EmployeeCreateRequest): Observable<EmployeeResponse> {
    return this.http.post<EmployeeResponse>(`${this.base}/employees`, employeeData);
  }

  getEmployees(page: number, size: number, employeeIdFilter: string): Observable<EmployeePage> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (employeeIdFilter) {
      params = params.set('search', employeeIdFilter);
    }

    return this.http.get<EmployeePage>(`${this.base}/employees`, { params });
  }

  getEmployeeById(employeeId: string): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(`${this.base}/employees/${employeeId}`);
  }

  updateEmployee(
    employeeId: string,
    employeeData: EmployeeUpdateRequest
  ): Observable<EmployeeResponse> {
    return this.http.put<EmployeeResponse>(`${this.base}/employees/${employeeId}`, employeeData);
  }

  updateEmployeeStatus(
    employeeId: string,
    status: 'ACTIVE' | 'INACTIVE'
  ): Observable<EmployeeResponse> {
    const url = `${this.base}/employees/${employeeId}/status`;
    const body = { status };
    return this.http.patch<EmployeeResponse>(url, body);
  }

  startEmployeeCsvJob(file: File): Observable<JobLaunchResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<JobLaunchResponse>(`${this.base}/employees/upload-csv`, formData);
  }

  getEmployeeJobStatus(executionId: number): Observable<JobCompletionResponse> {
    return this.http.get<JobCompletionResponse>(`${this.base}/status/${executionId}`);
  }

  downloadEmployeeCsvFormat(): Observable<Blob> {
    return this.http.get(`${this.base}/employees/format`, { responseType: 'blob' });
  }

  getBankAccounts(organizationId: string): Observable<BankAccountSummary[]> {
    return this.http.get<BankAccountSummary[]>(`${this.base}/${organizationId}/bank-accounts`);
  }

  getBankAccountDetails(organizationId: string, accountId: number): Observable<BankAccountDetails> {
    return this.http.get<BankAccountDetails>(
      `${this.base}/${organizationId}/bank-accounts/${accountId}`
    );
  }

  createBankAccount(
    details: BankAccountCreateRequest,
    cancelledCheque: File,
    gstCertificate: File
  ): Observable<BankAccountDetails> {
    const formData = new FormData();
    formData.append('details', JSON.stringify(details));
    formData.append('Cancelled cheque', cancelledCheque, cancelledCheque.name);
    formData.append('GST Certificate', gstCertificate, gstCertificate.name);
    return this.http.post<BankAccountDetails>(`${this.base}/bank-accounts`, formData);
  }

  createClientVendor(data: ClientVendorCreateRequest): Observable<ClientVendor> {
    return this.http.post<ClientVendor>(`${this.base}/clients-vendors`, data);
  }

  getClientVendors(
    orgId: string,
    type: ClientVendorType,
    page: number,
    size: number
  ): Observable<ClientVendorPage> {
    const endpoint = type === ClientVendorType.CLIENT ? 'clients' : 'vendors';
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<ClientVendorPage>(`${this.base}/${orgId}/${endpoint}`, { params });
  }

  createDepositRequest(data: PaymentRequestCreate, file?: File | null): Observable<PaymentRequest> {
    const formData = new FormData();
    formData.append('details', JSON.stringify(data));
    if (file) {
      formData.append('file', file, file.name);
    }
    return this.http.post<PaymentRequest>(`${this.base}/deposit-requests`, formData);
  }

   getAllPaymentRequests(orgId: string): Observable<PaymentRequestPage> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '1000');
      
    return this.http.get<PaymentRequestPage>(`${this.base}/${orgId}/requests`, { params });
  }

  createVendorPaymentRequest(data: PaymentRequestCreate): Observable<PaymentRequest> {
    return this.http.post<PaymentRequest>(`${this.base}/payment-requests/vendor`, data);
  }
   startSalaryCsvJob(file: File, accountId: number): Observable<JobLaunchResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<JobLaunchResponse>(`${this.salaryJobBase}/${accountId}/start`, formData);
  }
  getSalaryJobStatus(executionId: number): Observable<JobCompletionResponse> {
    return this.http.get<JobCompletionResponse>(`${this.salaryJobBase}/${executionId}/status`);
  }
   downloadSalaryCsvFormat(): Observable<Blob> {
    return this.http.get(`${this.base}/payment-requests/salary/format`, {
      responseType: 'blob'
    });
  }

  uploadSalariesFromCsv(orgId: string, accountId: number, file: File): Observable<BulkUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    
    // This matches your endpoint: POST /{orgId}/payment-requests/salary/{accountId}
    const url = `${this.base}/${orgId}/payment-requests/salary/${accountId}`;
    
    return this.http.post<BulkUploadResponse>(url, formData);
  }

  getPaymentRequestDetails(requestId: number): Observable<PaymentRequestDetails> {
    return this.http.get<PaymentRequestDetails>(`${this.base}/payment-requests/${requestId}`);
  }
}
