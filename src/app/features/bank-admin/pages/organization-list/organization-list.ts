<<<<<<< HEAD
// src/app/features/bank-admin/pages/organization-list/organization-list.component.ts
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BankAdminService } from '../../../../core/services/bank-admin.service';
import { Page, Organization } from '../../../../core/model/model';

// Custom Imports

@Component({
  selector: 'app-organization-list',
  templateUrl: 'organization-list.html',
  styleUrl: 'organization-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule,
    RouterLink,
  ],
})
export default class OrganizationListComponent {
  private readonly bankAdminService = inject(BankAdminService);
  private readonly dialog = inject(MatDialog);
  
  // Component State using Signals
  readonly state = signal<{
    page: Page<Organization> | null;
    isLoading: boolean;
    error: string | null;
  }>({
    page: null,
    isLoading: true,
    error: null,
  });

  readonly displayedColumns = ['name', 'email', 'status', 'actions'];
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  constructor() {
    // Effect to fetch data when pagination changes
    effect(() => {
      this.fetchOrganizations(this.currentPage(), this.pageSize());
    });
  }

  fetchOrganizations(page: number, size: number): void {
    console.log('STEP 1: Component is about to call the service.')
    this.state.update(s => ({ ...s, isLoading: true }));
    this.bankAdminService.getOrganizations(page, size).subscribe({
      next: (pageData) => this.state.set({ page: pageData, isLoading: false, error: null }),
      error: (err) => this.state.set({ page: null, isLoading: false, error: 'Failed to load organizations.' })
    });
  }
  
  handlePageEvent(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateOrganizationDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        // Refresh the current page to show the new organization
        this.fetchOrganizations(this.currentPage(), this.pageSize());
      }
    });
  }
}


// A separate component for the dialog content
@Component({
  selector: 'app-create-organization-dialog',
  template: `
    <h2 mat-dialog-title>Create New Organization</h2>
    <mat-dialog-content [formGroup]="form">
      <mat-form-field>
        <mat-label>Organization Name</mat-label>
        <input matInput formControlName="name" required>
        @if(form.controls.name.hasError('required')) {
          <mat-error>Name is required</mat-error>
        }
      </mat-form-field>
      <mat-form-field>
        <mat-label>Organization Email</mat-label>
        <input matInput formControlName="email" required>
        @if(form.controls.email.hasError('required')) {
          <mat-error>Email is required</mat-error>
        }
        @if(form.controls.email.hasError('email')) {
          <mat-error>Please enter a valid email</mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="create()">
        Create
      </button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class CreateOrganizationDialog {
  private readonly fb = inject(FormBuilder);
  private readonly bankAdminService = inject(BankAdminService);
  private readonly snackBar = inject(MatSnackBar);

=======
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
  AfterViewInit,
  ElementRef,
  viewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { BankAdminService } from '../../../../core/services/bank-admin.service';
import { Organization, OrganizationStatus, Page } from '../../../../core/model/model';

// Custom Application Imports


@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule // Required for the modal's form
  ],
  templateUrl: './organization-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrganizationListComponent implements AfterViewInit {
  // ## Injected Services
  private readonly bankAdminService = inject(BankAdminService);
  private readonly fb = inject(FormBuilder);

  // ## Component State Signals
  readonly state = signal<{
    page: Page<Organization> | null;
    status: 'loading' | 'loaded' | 'error';
    error: string | null;
  }>({
    page: null,
    status: 'loading',
    error: null,
  });

  // ## Pagination State
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  // ## UI State for Bootstrap Components
  readonly toastMessage = signal('');
  readonly toastIsError = signal(false);

  // ## Form for Creating a New Organization
>>>>>>> bfe16112ad3d0f1056fa86ed2757c60fe77dfb19
  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

<<<<<<< HEAD
  create(): void {
    if (this.form.invalid) return;

    this.bankAdminService.createOrganization(this.form.value as { name: string; email: string })
      .subscribe({
        next: () => {
          this.snackBar.open('Organization created successfully!', 'Close', { duration: 3000 });
          // Close the dialog and pass a success flag
        },
        error: () => this.snackBar.open('Error creating organization.', 'Close', { duration: 3000 }),
      });
=======
  // ## References to Template Elements for Bootstrap JS
  private createModalElement = viewChild.required<ElementRef<HTMLDivElement>>('createOrgModal');
  private notificationToastElement = viewChild.required<ElementRef<HTMLDivElement>>('notificationToast');
  // ✅ Reference to the button that opens the modal for focus management
  private createOrgBtn = viewChild.required<ElementRef<HTMLButtonElement>>('createOrgBtn');

  private createModal?: bootstrap.Modal;
  private notificationToast?: bootstrap.Toast;

  // ## Lifecycle Hooks
  constructor() {
    // Reactively fetch data whenever pagination changes
    effect(() => {
      this.fetchOrganizations(this.currentPage(), this.pageSize());
    });
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap components after the view is rendered
    const modalEl = this.createModalElement().nativeElement;
    this.createModal = new bootstrap.Modal(modalEl);
    this.notificationToast = new bootstrap.Toast(this.notificationToastElement().nativeElement);

    // ✅ ACCESSIBILITY FIX: Manage focus when the modal is opened and closed.
    modalEl.addEventListener('shown.bs.modal', () => {
      // When the modal is fully shown, move focus to the first input field.
      modalEl.querySelector<HTMLInputElement>('input[formControlName="name"]')?.focus();
    });

    modalEl.addEventListener('hidden.bs.modal', () => {
      // When the modal is fully hidden, return focus to the button that opened it.
      this.createOrgBtn().nativeElement.focus();
    });
  }

  // ## Data Fetching
  fetchOrganizations(page: number, size: number): void {
    this.state.update(s => ({ ...s, status: 'loading' }));
    this.bankAdminService.getOrganizations(page, size).subscribe({
      next: (pageData) => this.state.set({ page: pageData, status: 'loaded', error: null }),
      error: (err) => this.state.set({ page: null, status: 'error', error: 'Failed to load organizations.' })
    });
  }

  // ## Event Handlers for UI Interaction
  openCreateDialog(): void {
    this.form.reset();
    this.createModal?.show();
  }

  createOrganization(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.createModal?.hide();
    this.showToast('Creating Organization...', false);

    const orgData = this.form.value as { name: string; email: string };
    this.bankAdminService.createOrganization(orgData).subscribe({
      next: () => {
        this.createModal?.hide();
        this.showToast('Organization created successfully!');
        this.fetchOrganizations(this.currentPage(), this.pageSize()); // Refresh list
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to create organization.', true);
      },
    });
  }

  handlePageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newSize = Number(selectElement.value);
    
    this.pageSize.set(newSize);
    this.currentPage.set(0); // Reset to the first page
  }

  handlePageChange(page: number): void {
    this.currentPage.set(page);
  }

  // ## Helper Functions
  private showToast(message: string, isError: boolean = false): void {
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    this.notificationToast?.show();
  }

  getStatusBadgeClass(status: OrganizationStatus): string {
    switch (status) {
      case OrganizationStatus.APPROVED: return 'bg-success';
      case OrganizationStatus.REJECTED: return 'bg-danger';
      case OrganizationStatus.PENDING: return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
>>>>>>> bfe16112ad3d0f1056fa86ed2757c60fe77dfb19
  }
}