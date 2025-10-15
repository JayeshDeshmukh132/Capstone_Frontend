import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs'; // Ensure forkJoin is imported
import { OrganizationService } from '../../../../core/services/organization.service';
import { BankAccountSummary } from '../../../../core/model/bank-account.model';
import { PaymentRequestCreate, PaymentType } from '../../../../core/model/payment-request.model';
import { ClientVendorSummary, ClientVendorType } from '../../../../core/model/client-vendor.model';

@Component({
  selector: 'app-create-vendor-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-vendor-payment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateVendorPaymentComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private orgService = inject(OrganizationService);

  // Initial state must be 'loading'
  status = signal<'loading' | 'submitting' | 'idle'>('loading');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  bankAccounts = signal<BankAccountSummary[]>([]);
  vendors = signal<ClientVendorSummary[]>([]);

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required, Validators.maxLength(200)]],
    bankAccountId: [null as number | null, [Validators.required]],
    clientVendorId: [null as number | null, [Validators.required]],
  });

  constructor() {
    this.loadInitialData();
  }

  loadInitialData(): void {
    const orgId = localStorage.getItem('org_id');
    if (!orgId) {
      this.errorMessage.set('Organization ID not found. Please log in again.');
      this.status.set('idle'); // Stop loading and show the error
      return;
    }

    // Use forkJoin to wait for both API calls to complete or for one to fail.
    forkJoin({
      accounts: this.orgService.getBankAccounts(orgId),
      vendorsPage: this.orgService.getClientVendors(orgId, ClientVendorType.VENDOR, 0, 1000), // Get all vendors
    }).subscribe({
      next: (results) => {
        this.bankAccounts.set(
          results.accounts.filter((a) => a.bankStatus === 'ACTIVE' || a.bankStatus === 'APPROVED')
        );
        this.vendors.set(results.vendorsPage.content);

        // This is the success path: stop loading and show the form.
        this.status.set('idle');
      },
      // ====================================================================
      // START: FIX FOR STUCK LOADING SCREEN
      // This error block is crucial. It catches failures from EITHER API call.
      // ====================================================================
      error: (err) => {
        console.error('Error loading initial data for form', err);
        this.errorMessage.set(
          'Failed to load required data (accounts or vendors). Please refresh the page.'
        );
        // This is the failure path: stop loading and show the error.
        this.status.set('idle');
      },
      // ====================================================================
      // END: FIX
      // ====================================================================
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('submitting');
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const request: PaymentRequestCreate = {
      ...this.form.value,
      paymentType: PaymentType.VENDOR,
    } as PaymentRequestCreate;

    this.orgService.createVendorPaymentRequest(request).subscribe({
      next: () => {
        this.successMessage.set('Vendor payment request submitted successfully!');
        this.status.set('idle');
        this.form.reset();
        setTimeout(() => this.router.navigate(['/org/payment-requests']), 2000);
      },

  
      error: (err: HttpErrorResponse) => {
        const backendMessage = err.error?.message;
        let userMessage = 'An unexpected server error occurred. Please try again later.';

        if (err.status === 403) {
          userMessage =
            backendMessage || 'Insufficient funds in the selected account for this payment.';
        } else if (err.status === 400) {
          userMessage =
            backendMessage ||
            'Invalid data submitted. Please check the account/organization status.';
        } else if (err.status === 404) {
          userMessage = backendMessage || 'The selected vendor or bank account could not be found.';
        }

        this.errorMessage.set(userMessage);
        this.status.set('idle');
      },
     
    });
  }
}
