import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizationService } from '../../../../core/services/organization.service';
import { EmployeeCreateRequest, EmployeeResponse } from '../../../../core/model/employee.model';

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-employee.html',
  styleUrls: ['./create-employee.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEmployee {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private orgService = inject(OrganizationService);

  // --- UI State Signals ---
  private loadingSignal = signal(false);
  private alertSignal = signal<{ visible: boolean; message: string; type: string } | null>(null);

  readonly loading = computed(() => this.loadingSignal());
  readonly alert = computed(() => this.alertSignal());

  // --- Form Definition (Updated for new fields) ---
  readonly form = this.fb.group({
    employeeId: ['', [Validators.required]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    designation: ['', [Validators.required]],
    department: ['', [Validators.required]],
    accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$')]], // Common bank account length
    ifscCode: ['', [Validators.required, Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]], // Standard Indian IFSC pattern
    joiningDate: ['', [Validators.required]],
  });

  // --- Alert Management ---
  private showAlert(message: string, type: 'success' | 'danger' | 'warning'): void {
    this.alertSignal.set({ visible: true, message, type: `alert-soft-${type}` });
  }

  hideAlert(): void {
    this.alertSignal.set(null);
  }

  // --- Form Submission ---
  onSubmit(): void {
    this.hideAlert();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showAlert('Please correct the errors in the form.', 'warning');
      return;
    }

    this.loadingSignal.set(true);
    const employeeData = this.form.value as EmployeeCreateRequest;

    this.orgService.createEmployee(employeeData).subscribe({
      next: (response: EmployeeResponse) => {
        this.loadingSignal.set(false);
        this.showAlert(`Employee "${response.firstName} ${response.lastName}" created successfully!`, 'success');
        this.form.reset();
        // You could navigate away after success, e.g., to an employee list page
        // setTimeout(() => this.router.navigate(['/org/employees']), 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        console.error('Create employee failed', err);

        const backendMessage = err.error?.message;
        if (err.status === 409) { // Conflict (e.g., email or employeeId already exists)
          this.showAlert(backendMessage || 'An employee with this email or ID already exists.', 'danger');
        } else if (err.status === 400) { // Bad Request (Validation errors)
          this.showAlert(backendMessage || 'Invalid data. Please check the form fields.', 'danger');
        } else { // Generic server error
          this.showAlert('An unexpected server error occurred. Please try again later.', 'danger');
        }
      },
    });
  }
}