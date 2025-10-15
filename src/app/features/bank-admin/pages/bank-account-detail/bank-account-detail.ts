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
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

// Custom Application Imports
import { BankAdminService } from '../../../../core/services/bank-admin.service';
import { BankAccountDetail, BankAccountStatus, Organization } from '../../../../core/model/model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bank-account-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bank-account-detail.html',
  styles: `
    .toast-container {
      z-index: 1090;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BankAccountDetailComponent implements AfterViewInit {
  // ## Injected Services & Route Inputs
  orgId = input.required<string>();
  accountId = input.required<string>();
  private readonly bankAdminService = inject(BankAdminService);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);


  // ## State Signals
  readonly state = signal<{
    account: BankAccountDetail | null;
    status: 'loading' | 'loaded' | 'error';
    error: string | null;
  }>({
    account: null,
    status: 'loading',
    error: null,
  });

  // ## UI State Signals for Modal and Toast
  readonly selectedStatusForUpdate = signal<BankAccountStatus | null>(null);
  readonly toastMessage = signal('');
  readonly toastIsError = signal(false);

  // ## Form for the Update Modal
  readonly updateForm = this.fb.group({
    note: ['']
  });

  // ## Template Element References
  private updateModalElement = viewChild.required<ElementRef<HTMLDivElement>>('updateStatusModal');
  private notificationToastElement = viewChild.required<ElementRef<HTMLDivElement>>('notificationToast');

  private updateModal?: bootstrap.Modal;
  private notificationToast?: bootstrap.Toast;

  private modalTriggerElement: HTMLElement | null = null;
  // Expose enum to template
  readonly BankAccountStatus = BankAccountStatus;

  // ## Lifecycle Hooks
  constructor() {
    effect(() => {
      const org = this.route.snapshot.paramMap.get('orgId');
      const acc = this.route.snapshot.paramMap.get('accountId');
      if (org && acc) {
        this.fetchAccountDetails(org, acc);
      }
    });
  }

  ngAfterViewInit(): void {
      // Initialize both the modal and the toast
      this.updateModal = new bootstrap.Modal(this.updateModalElement().nativeElement);
      this.notificationToast = new bootstrap.Toast(this.notificationToastElement().nativeElement);
    }

  // ## Data Fetching
  fetchAccountDetails(orgId: string, accountId: string): void {
    this.state.set({ account: null, status: 'loading', error: null });
    this.bankAdminService.getBankAccountById(Number(orgId), Number(accountId)).subscribe({
      next: (account) => this.state.set({ account, status: 'loaded', error: null }),
      error: () => this.state.set({ account: null, status: 'error', error: 'Failed to load account details.' }),
    });
  }

  // ## Event Handlers
  openUpdateDialog(newStatus: BankAccountStatus): void {
    
    this.selectedStatusForUpdate.set(newStatus);
    this.updateForm.reset();
    if (newStatus === BankAccountStatus.REJECTED) {
      this.updateForm.controls.note.setValidators(Validators.required);
    } else {
      this.updateForm.controls.note.clearValidators();
    }
    this.updateForm.controls.note.updateValueAndValidity();
    
    this.updateModal?.show();
  }
  
  submitUpdate(): void {
    const status = this.selectedStatusForUpdate();
    const account = this.state().account;

    if (this.updateForm.invalid || !status || !account) {
      this.updateForm.markAllAsTouched();
      return;
    }

    const modalEl = this.updateModalElement().nativeElement;
    
    const afterModalHidden = () => {
      this.showToast('Updating account status...', false);
      const note = this.updateForm.value.note ?? '';

      this.bankAdminService.updateBankAccountStatus(Number(account.id), status, note).subscribe({
        next: () => {
          this.fetchAccountDetails(String(account.organizationId), String(account.id));
          this.showToast('Bank account status updated successfully!');
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Failed to update status.';
          this.showToast(errorMessage, true);
        },
      });
    };

    modalEl.addEventListener('hidden.bs.modal', afterModalHidden, { once: true });
    this.updateModal?.hide();
  }

  goBack(): void {
    this.location.back();
  }

  // ## Helper Methods
  private showToast(message: string, isError: boolean = false): void {
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    this.notificationToast?.show();
  }

  getStatusBadgeClass(status: BankAccountStatus): string {
    switch (status) {
      case BankAccountStatus.ACTIVE:
        return 'bg-success';
      case BankAccountStatus.REJECTED:
        return 'bg-danger';
      case BankAccountStatus.PENDING:
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }
}