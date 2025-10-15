import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { OrganizationService } from '../../../../core/services/organization.service';
import { PaymentRequestDetails } from '../../../../core/model/payment-request.model';

@Component({
  selector: 'app-payment-request-detail-dialog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './payment-request-detail-dialog.html',
  styleUrls: ['../create-bank-account-dialog/create-bank-account-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentRequestDetailDialogComponent {
  private orgService = inject(OrganizationService);
  
  @Output() closed = new EventEmitter<void>();

  // --- STATE SIGNALS ---
  private state = signal<{
    details: PaymentRequestDetails | null;
    loading: boolean;
    error: string | null;
  }>({ details: null, loading: true, error: null });

  readonly details = computed(() => this.state().details);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  @Input({ required: true })
  set requestId(id: number) {
    if (id) {
      this.fetchDetails(id);
    }
  }

  constructor() {}

  private fetchDetails(id: number): void {
    this.state.set({ details: null, loading: true, error: null });

    this.orgService.getPaymentRequestDetails(id).subscribe({
      next: (details) => this.state.set({ details, loading: false, error: null }),
      error: (err) => {
        console.error(err);
        this.state.set({ details: null, loading: false, error: 'Failed to load request details.' });
      },
    });
  }

  closeDialog(): void {
    this.closed.emit();
  }
}