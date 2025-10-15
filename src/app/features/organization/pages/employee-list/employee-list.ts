import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { OrganizationService } from '../../../../core/services/organization.service';
import { EmployeePage, EmployeeSummary } from '../../../../core/model/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeList {
  private orgService = inject(OrganizationService);

  // --- State Signals ---
  private state = signal<{
    page: EmployeePage | null;
    loading: boolean;
    error: string | null;
  }>({
    page: null,
    loading: true,
    error: null,
  });

  // --- Public View Models ---
  readonly page = computed(() => this.state().page);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  
  // --- Pagination and Filter State ---
  private currentPage = signal(0);
  private pageSize = signal(10);
  
  readonly searchControl = new FormControl('');
  private searchSubscription: Subscription;

  constructor() {
    this.fetchEmployees(); // Initial fetch

    // Efficient real-time search subscription
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(400),       // Wait for 400ms pause in typing
      distinctUntilChanged()  // Only emit if the value has changed
    ).subscribe(() => {
      this.currentPage.set(0); // Reset to first page on new search
      this.fetchEmployees();
    });
  }

  fetchEmployees(): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    const filter = this.searchControl.value ?? '';

    this.orgService.getEmployees(this.currentPage(), this.pageSize(), filter).subscribe({
      next: (pageData) => {
        this.state.set({ page: pageData, loading: false, error: null });
      },
      error: (err) => {
        this.state.set({ page: null, loading: false, error: 'Failed to load employees. Please try again.' });
      },
    });
  }

  handlePageChange(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < (this.page()?.totalPages ?? 0)) {
      this.currentPage.set(pageIndex);
      this.fetchEmployees();
    }
  }

  toggleEmployeeStatus(employee: EmployeeSummary): void {
    const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionText = newStatus === 'INACTIVE' ? 'deactivate' : 'activate';

    // Best Practice: Always confirm a deactivation.
    if (newStatus === 'INACTIVE') {
      const confirmed = window.confirm(
        `Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}?`
      );
      if (!confirmed) {
        return; // User cancelled the action
      }
    }

    this.orgService.updateEmployeeStatus(employee.employeeId, newStatus).subscribe({
      next: (updatedEmployee) => {
        // Update the state immutably to trigger change detection
        this.state.update(currentState => {
          if (!currentState.page) return currentState;

          const updatedContent = currentState.page.content.map(emp => 
            emp.employeeId === updatedEmployee.employeeId ? { ...emp, status: updatedEmployee.status } : emp
          );

          return { 
            ...currentState, 
            page: { ...currentState.page, content: updatedContent } 
          };
        });
        // Optionally show a success toast/alert here
      },
      error: (err) => {
        console.error('Failed to update employee status', err);
        // Show an error alert to the user
        window.alert('Failed to update status. Please try again.');
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up the subscription to prevent memory leaks
    this.searchSubscription.unsubscribe();
  }
}