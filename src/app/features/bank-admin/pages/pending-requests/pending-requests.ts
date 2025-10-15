import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  AfterViewInit,
  ElementRef,
  viewChild,
  OnInit // Import OnInit
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

// Custom Application Imports
import { BankAdminService } from '../../../../core/services/bank-admin.service';
import { PaymentRequest, DepositRequest, PaymentType, RequestStatus, Page } from '../../../../core/model/model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pending-requests',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './pending-requests.html',
  styles: `
    .toast-container { z-index: 1090; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PendingRequestsComponent implements OnInit, AfterViewInit {
  // ## Injected Services
  private readonly bankAdminService = inject(BankAdminService);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  // ## State Signals
  readonly paymentRequestsState = signal<{ page: Page<PaymentRequest> | null; status: 'loading' | 'loaded' | 'error'; }>({ page: null, status: 'loading' });
  readonly depositRequestsState = signal<{ page: Page<DepositRequest> | null; status: 'loading' | 'loaded' | 'error'; }>({ page: null, status: 'loading' });
  
  // ## Pagination and Filter State
  readonly paymentFilter = signal<PaymentType | 'ALL'>('ALL');
  readonly paymentCurrentPage = signal(0);
  readonly paymentPageSize = signal(5);
  readonly depositCurrentPage = signal(0);
  readonly depositPageSize = signal(5);

  // ## Modal and Toast State
  readonly selectedRequest = signal<{ request: PaymentRequest | DepositRequest, type: 'payment' | 'deposit' } | null>(null);
  readonly newStatus = signal<RequestStatus | null>(null);
  readonly toastMessage = signal('');
  readonly toastIsError = signal(false);

   // ## Template Element References
  private updateModalElement = viewChild.required<ElementRef<HTMLDivElement>>('updateRequestModal');
  private notificationToastElement = viewChild.required<ElementRef<HTMLDivElement>>('notificationToast');
  private modalTriggerElement: HTMLElement | null = null;
  
  // ## Form and Other Properties
  readonly updateForm = this.fb.group({ note: [''] });
  // private modalTriggerElement: HTMLElement | null = null;
  readonly PaymentType = PaymentType;
  readonly RequestStatus = RequestStatus;
  private currentOrgId: string | null = null; // To store the static ID

  constructor() {
    // ✅ EFFECT FOR PAYMENTS: This now correctly watches the filter and pagination signals.
    effect(() => {
      // It uses the 'currentOrgId' property which is set once in ngOnInit.
      if (this.currentOrgId) {
        this.fetchPaymentRequests(
          this.currentOrgId,
          this.paymentFilter(),
          this.paymentCurrentPage(),
          this.paymentPageSize()
        );
      }
    });

    // ✅ EFFECT FOR DEPOSITS: This now correctly watches the pagination signals.
    effect(() => {
      if (this.currentOrgId) {
        this.fetchDepositRequests(
          this.currentOrgId,
          this.depositCurrentPage(),
          this.depositPageSize()
        );
      }
    });
  }

  ngOnInit(): void {
    // ✅ Fetch the static route parameter ONCE when the component initializes.
    this.currentOrgId = this.route.snapshot.paramMap.get('orgId');
  }

  ngAfterViewInit(): void {
    const modalEl = this.updateModalElement().nativeElement;
    modalEl.addEventListener('hidden.bs.modal', () => this.modalTriggerElement?.focus());
    modalEl.addEventListener('shown.bs.modal', () => modalEl.querySelector<HTMLTextAreaElement>('textarea')?.focus());
  }

  // ## Data Fetching Methods (remain the same)
  fetchPaymentRequests(orgId: string, filter: PaymentType | 'ALL', page: number, size: number): void {
    this.paymentRequestsState.set({ page: null, status: 'loading' });
    this.bankAdminService.getPendingPaymentRequests(Number(orgId), filter, page, size).subscribe({
      next: (pageData) => this.paymentRequestsState.set({ page: pageData, status: 'loaded' }),
      error: () => this.paymentRequestsState.set({ page: null, status: 'error' }),
    });
  }

  fetchDepositRequests(orgId: string, page: number, size: number): void {
    this.depositRequestsState.set({ page: null, status: 'loading' });
    this.bankAdminService.getPendingDepositRequests(Number(orgId), page, size).subscribe({
      next: (pageData) => this.depositRequestsState.set({ page: pageData, status: 'loaded' }),
      error: () => this.depositRequestsState.set({ page: null, status: 'error' }),
    });
  }

  // ## Event Handlers: These now ONLY update signals. The effect will handle the rest.
  setPaymentFilter(filter: PaymentType | 'ALL'): void {
    this.paymentCurrentPage.set(0); 
    this.paymentFilter.set(filter); // This change triggers the payment effect.
  }

  handlePaymentPageChange(page: number): void { 
    this.paymentCurrentPage.set(page); // This change triggers the payment effect.
  }

  handlePaymentPageSizeChange(event: Event): void { 
    this.paymentCurrentPage.set(0); 
    this.paymentPageSize.set(Number((event.target as HTMLSelectElement).value)); // This change triggers the payment effect.
  }

  handleDepositPageChange(page: number): void { 
    this.depositCurrentPage.set(page); // This change triggers the deposit effect.
  }

  handleDepositPageSizeChange(event: Event): void { 
    this.depositCurrentPage.set(0);
    this.depositPageSize.set(Number((event.target as HTMLSelectElement).value)); // This change triggers the deposit effect.
  }

  // Other event handlers (openDialog, submitUpdate, goBack) remain the same...
  openDialog(request: PaymentRequest | DepositRequest, type: 'payment' | 'deposit', status: RequestStatus, event: MouseEvent): void {
    this.modalTriggerElement = event.target as HTMLElement;
    this.selectedRequest.set({ request, type });
    this.newStatus.set(status);
    this.updateForm.reset();
    if (status === RequestStatus.REJECTED) {
      this.updateForm.controls.note.setValidators(Validators.required);
    } else {
      this.updateForm.controls.note.clearValidators();
    }
    this.updateForm.controls.note.updateValueAndValidity();
    bootstrap.Modal.getOrCreateInstance(this.updateModalElement().nativeElement).show();
  }

  submitUpdate(): void {
    const selection = this.selectedRequest();
    const status = this.newStatus();
    if (this.updateForm.invalid || !selection || !status) return;

    const modalEl = this.updateModalElement().nativeElement;
    const modalInstance = bootstrap.Modal.getInstance(modalEl);

    const afterModalHidden = () => {
      this.showToast('Updating request status...', false);
      const note = this.updateForm.value.note ?? '';
      const request$ = selection.type === 'payment'
        ? this.bankAdminService.updatePaymentRequestStatus(selection.request.id, status, note)
        : this.bankAdminService.updateDepositRequestStatus(selection.request.id, status, note);
      
      request$.subscribe({
        next: () => {
          this.showToast('Request status updated successfully!');
          this.refreshData();
        },
        error: (err) => this.showToast(err.error?.message || 'Failed to update status.', true),
      });
    };

    modalEl.addEventListener('hidden.bs.modal', afterModalHidden, { once: true });
    modalInstance?.hide();
  }
  
  goBack(): void { this.location.back(); }

  private refreshData(): void {
    if (this.currentOrgId) {
      this.fetchPaymentRequests(this.currentOrgId, this.paymentFilter(), this.paymentCurrentPage(), this.paymentPageSize());
      this.fetchDepositRequests(this.currentOrgId, this.depositCurrentPage(), this.depositPageSize());
    }
  }

  private showToast(message: string, isError: boolean = false): void {
    const toastEl = this.notificationToastElement().nativeElement;
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
  }
}