import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizationService } from '../../../../core/services/organization.service';
import { EmployeeUpdateRequest } from '../../../../core/model/employee.model';


@Component({
  selector: 'app-update-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update-employee.html',
  styleUrls: ['./update-employee.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateEmployee {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orgService = inject(OrganizationService);

  private routeEmployeeId = this.route.snapshot.paramMap.get('id');

  // --- Store the original unique values ---
  private originalEmployeeId: string | null = null;
  private originalEmail: string | null = null;

  // --- UI State ---
  private state = signal<{
    loading: boolean;
    saving: boolean;
    alert: { message: string; type: string } | null;
  }>({
    loading: true,
    saving: false,
    alert: null,
  });

  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly alert = computed(() => this.state().alert);

  // --- Form Definition (fields are now enabled) ---
  readonly form = this.fb.group({
    employeeId: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    designation: ['', [Validators.required]],
    department: ['', [Validators.required]],
    accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$')]],
    ifscCode: ['', [Validators.required, Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]],
    joiningDate: ['', [Validators.required]],
  });

  constructor() {
    if (!this.routeEmployeeId) {
      this.showAlert('No employee ID found in URL.', 'danger');
      this.state.update(s => ({ ...s, loading: false }));
      return;
    }
    this.loadEmployee(this.routeEmployeeId);
  }

  loadEmployee(id: string): void {
    this.orgService.getEmployeeById(id).subscribe({
      next: (employee) => {
        // Store original values before patching the form
        this.originalEmployeeId = employee.employeeId;
        this.originalEmail = employee.email;
        
        this.form.patchValue(employee);
        this.state.update(s => ({ ...s, loading: false }));
      },
      error: () => {
        this.showAlert('Failed to load employee details.', 'danger');
        this.state.update(s => ({ ...s, loading: false }));
      }
    });
  }

  // --- Alert Management (no change) ---
  private showAlert(message: string, type: 'success' | 'danger' | 'warning'): void {
    this.state.update(s => ({ ...s, alert: { message, type: `alert-soft-${type}` } }));
  }

  hideAlert(): void {
    this.state.update(s => ({ ...s, alert: null }));
  }

  // --- Form Submission (Updated Logic) ---
  onSubmit(): void {
    this.hideAlert();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.routeEmployeeId) return;

    this.state.update(s => ({ ...s, saving: true }));
    const formValues = this.form.getRawValue();
    
    // --- Conditionally build the payload ---
    const updatePayload: EmployeeUpdateRequest = {
      // These fields are always sent
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      designation: formValues.designation,
      department: formValues.department,
      accountNumber: formValues.accountNumber,
      ifscCode: formValues.ifscCode,
      joiningDate: formValues.joiningDate,
    };

    // Only add employeeId to the payload IF it has changed from the original
    if (formValues.employeeId !== this.originalEmployeeId) {
      updatePayload.employeeId = formValues.employeeId;
    }

    // Only add email to the payload IF it has changed from the original
    if (formValues.email !== this.originalEmail) {
      updatePayload.email = formValues.email;
    }
    
    // NOTE: This assumes your service's updateEmployee method can accept this payload.
    // We'll adjust the service method signature to be more flexible.
    this.orgService.updateEmployee(this.routeEmployeeId, updatePayload).subscribe({
      next: () => {
        this.state.update(s => ({ ...s, saving: false }));
        this.showAlert('Employee details updated successfully!', 'success');
        
        // Important: If the ID was changed, we must navigate to the new URL
        // or simply back to the list.
        const newId = updatePayload.employeeId || this.routeEmployeeId;
        if (newId !== this.routeEmployeeId) {
            this.router.navigate(['/org/employees']); // Go back to the list if ID changed
        } else {
            setTimeout(() => this.router.navigate(['/org/employees']), 2000);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.state.update(s => ({ ...s, saving: false }));
        const backendMessage = err.error?.message;
        if (err.status === 409) { // Conflict (e.g., new email/ID is already in use)
          this.showAlert(backendMessage || 'The new Email or Employee ID is already in use.', 'danger');
        } else {
          this.showAlert(backendMessage || 'Failed to update employee.', 'danger');
        }
      }
    });
  }
}