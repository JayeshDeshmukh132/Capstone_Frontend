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
  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

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
  }
}