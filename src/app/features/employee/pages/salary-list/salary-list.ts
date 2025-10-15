// src/app/features/employee/pages/salary-list/salary-list.component.ts
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Page, SalaryHistoryItem } from '../../../../core/model/model';
import { EmployeeService } from '../../../../core/services/employee.service';

@Component({
  selector: 'app-salary-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './salary-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SalaryListComponent {
  private readonly employeeService = inject(EmployeeService);

  readonly state = signal<{ page: Page<SalaryHistoryItem> | null; status: 'loading' | 'loaded' | 'error'; error: string | null; }>({ page: null, status: 'loading', error: null });
  readonly currentPage = signal(0);
  readonly pageSize = signal(5);

  constructor() {
    effect(() => {
      this.fetchSalaries(this.currentPage(), this.pageSize());
      this.currentPage(),
      this.pageSize()
    });
  }

  fetchSalaries(page: number, size: number): void {
    this.state.update(s => ({ ...s, status: 'loading' }));
    this.employeeService.getSalaryHistory(page, size).subscribe({
      next: (pageData) => this.state.set({ page: pageData, status: 'loaded', error: null }),
      error: () => this.state.set({ page: null, status: 'error', error: 'Failed to load salary history.' }),
    });
  }
  
  // Pagination handlers can be added here as before if needed
  handlePageChange(page: number): void { 
    this.currentPage.set(page); 
  }

  handlePageSizeChange(event: Event): void { 
    this.currentPage.set(0); 
    this.pageSize.set(Number((event.target as HTMLSelectElement).value)); 
  }

}