import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, SalaryHistoryItem, SalarySlipDetail } from '../model/model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);

  // ✅ The base URL is now static and doesn't include an ID.
  private readonly API_BASE_URL =`${environment.apiUrl}/employee`;

  getSalaryHistory(page: number, size: number): Observable<Page<SalaryHistoryItem>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'id')
      .set('direction', 'desc');
    // ✅ URL is now built from the static base URL.
    return this.http.get<Page<SalaryHistoryItem>>(`${this.API_BASE_URL}/salary-history`, { params });
  }

  getSalarySlipDetail(salaryId: number): Observable<SalarySlipDetail> {
    // ✅ URL is now built from the static base URL.
    return this.http.get<SalarySlipDetail>(`${this.API_BASE_URL}/salary-slip/${salaryId}`);
  }

  downloadSalarySlip(salaryId: number): Observable<Blob> {
    // ✅ URL is now built from the static base URL.
    return this.http.get(`${this.API_BASE_URL}/salaries/${salaryId}/download`, {
      responseType: 'blob'
    });
  }
}