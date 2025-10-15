import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  AfterViewInit,
  ElementRef,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';


// Custom Application Imports
import { BankAdminService } from '../../../../core/services/bank-admin.service';
import { Organization, OrganizationStatus } from '../../../../core/model/model';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './organization-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrganizationDetailComponent implements AfterViewInit {
  // ## Injected Services
  private readonly bankAdminService = inject(BankAdminService);
  private readonly fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);


  // ## Route Input
  id = input.required<string>();

  // ## Component State for Page Data
  readonly state = signal<{
    organization: Organization | null;
    status: 'loading' | 'loaded' | 'error';
    error: string | null;
  }>({
    organization: null,
    status: 'loading',
    error: null,
  });

  // ## State for the Update Modal
  readonly selectedOrgForUpdate = signal<Organization | null>(null);
  readonly newStatusForUpdate = signal<OrganizationStatus | null>(null);

  // ## Form for the Update Modal
  readonly updateForm = this.fb.group({
    note: ['']
  });

  // ## Template Element Reference for Bootstrap JS
  private updateModalElement = viewChild.required<ElementRef<HTMLDivElement>>('updateStatusModal');
  private updateModal?: bootstrap.Modal;

  readonly toastMessage = signal('');
  readonly toastIsError = signal(false);

  private notificationToastElement = viewChild.required<ElementRef<HTMLDivElement>>('notificationToast');
  private notificationToast?: bootstrap.Toast;

  // Make enum available in the template
  readonly OrganizationStatus = OrganizationStatus;

  // ## Lifecycle Hooks
  constructor() {
    // Reactively fetch data when the route ID changes
    effect(() => {
    const orgId = this.route.snapshot.paramMap.get('id'); // Get the ID from the signal
    
    // ✅ Only fetch data if the ID has a valid value
    if (orgId) {
      this.fetchOrganization(orgId);
    }
    });
  }

  ngAfterViewInit(): void {
    // Initialize both the modal and the toast
    this.updateModal = new bootstrap.Modal(this.updateModalElement().nativeElement);
    this.notificationToast = new bootstrap.Toast(this.notificationToastElement().nativeElement);
  }

  // ## Data Fetching
  fetchOrganization(id: string): void {
    this.state.set({ organization: null, status: 'loading', error: null });
    this.bankAdminService.getOrganizationById(Number(id)).subscribe({
      next: (org) => {
        this.state.set({ organization: org, status: 'loaded', error: null });
      },
      error: () => {
        this.state.set({ organization: null, status: 'error', error: 'Failed to load organization details.' });
      },
    });
  }

  // ## Event Handlers
  // ✅ FIX: The method now accepts the 'org' object as a parameter.
  openUpdateStatusDialog(org: Organization, newStatus: OrganizationStatus): void {
    this.selectedOrgForUpdate.set(org);
    this.newStatusForUpdate.set(newStatus);

    // Configure form validators based on the action
    this.updateForm.reset({ note: org.note || '' }); // Pre-fill with existing note
    if (newStatus === OrganizationStatus.REJECTED) {
      this.updateForm.controls.note.setValidators(Validators.required);
    } else {
      this.updateForm.controls.note.clearValidators();
    }
    this.updateForm.controls.note.updateValueAndValidity();

    this.updateModal?.show();
  }

  submitUpdate(): void {
    const org = this.selectedOrgForUpdate();
    const status = this.newStatusForUpdate();

    if (this.updateForm.invalid || !org || !status) {
      this.updateForm.markAllAsTouched();
      return;
    }
    
    const note = this.updateForm.value.note ?? '';

    this.bankAdminService.updateOrganizationStatus(Number(org.id), status, note).subscribe({
      next: () => {
        this.updateModal?.hide();
        this.fetchOrganization(String(org.id)); // Refresh data
        this.showToast('Organization status updated successfully!');
      },
      // ✅ MODIFY THIS ERROR BLOCK
      error: (err) => {
        this.updateModal?.hide(); // Still hide the modal on error
        // Extract the specific message from the API response
        const errorMessage = err.error?.message || 'An unexpected error occurred.';
        this.showToast(errorMessage, true); // Show the error toast
      },
    });
  }

  // ## Helper Functions
  getStatusBadgeClass(status: OrganizationStatus): string {
    switch (status) {
      case OrganizationStatus.APPROVED: return 'bg-success';
      case OrganizationStatus.REJECTED: return 'bg-danger';
      case OrganizationStatus.PENDING: return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  private showToast(message: string, isError: boolean = false): void {
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    this.notificationToast?.show();
  }
}