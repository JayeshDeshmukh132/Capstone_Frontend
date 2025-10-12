// src/app/features/bank-admin/services/bank-admin.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization, OrganizationStatus, Page } from '../model/model';
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
    return this.http.patch<void>(`${API_BASE_URL}/organizations/${id}/status`, { status, note });
  }

  // === Password Management ===
  
  changePassword(data: { oldPassword: string, newPassword: string }): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/change-password`, data);
  }

  // ... other methods for notifications, bank accounts, etc. would go here
}