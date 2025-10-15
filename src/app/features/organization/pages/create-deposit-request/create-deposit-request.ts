import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizationService } from '../../../../core/services/organization.service';
import { BankAccountSummary } from '../../../../core/model/bank-account.model';
import { PaymentRequestCreate, PaymentType } from '../../../../core/model/payment-request.model';

@Component({
  selector: 'app-create-deposit-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-deposit-request.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDepositRequestComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private orgService = inject(OrganizationService);

  status = signal<'loading' | 'submitting' | 'idle'>('loading');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  bankAccounts = signal<BankAccountSummary[]>([]);
  selectedFile = signal<File | null>(null);

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    note: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    bankAccountId: [null as number | null, [Validators.required]],
  });

  constructor() {
    this.loadBankAccounts();
  }

  loadBankAccounts(): void {
    const orgId = localStorage.getItem('org_id');
    if (!orgId) {
      this.errorMessage.set('Organization ID not found.');
      this.status.set('idle');
      return;
    }
    this.orgService.getBankAccounts(orgId).subscribe({
      next: (accounts) => {
        this.bankAccounts.set(accounts.filter(a => a.bankStatus === 'ACTIVE' || a.bankStatus === 'APPROVED'));
        this.status.set('idle');
      },
      error: () => {
        this.errorMessage.set('Could not load your bank accounts.');
        this.status.set('idle');
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('submitting');
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.form.value;

    const request: PaymentRequestCreate = {
      amount: formValue.amount!,
      bankAccountId: formValue.bankAccountId!,
      note: formValue.note!,
      paymentType: PaymentType.DEPOSIT,
      clientVendorId: null
    };

    const fileToUpload = this.selectedFile();

    this.orgService.createDepositRequest(request, fileToUpload).subscribe({
      next: () => {
        this.successMessage.set('Deposit request submitted successfully!');
        this.status.set('idle');
        this.form.reset();
        this.selectedFile.set(null);
        const fileInput = document.getElementById('file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        setTimeout(() => this.router.navigate(['/org/payment-requests']), 2000);
      },
      // ====================================================================
      // START: ENHANCED ERROR HANDLING BLOCK
      // ====================================================================
      error: (err: HttpErrorResponse) => {
        const backendMessage = err.error?.message;
        let userMessage = 'Failed to submit deposit request.';

        if (backendMessage) {
            // Check for specific error messages from the backend.
            // Note: Deposits won't have an "insufficient funds" error since they are incoming.
            if (backendMessage.toLowerCase().includes('not active')) {
                userMessage = 'The selected bank account is not active. Please choose another account.';
            } else if (backendMessage.toLowerCase().includes('does not belong to')) {
                userMessage = 'There was a security issue. The selected account does not belong to your organization.';
            } else {
                userMessage = backendMessage;
            }
        }
        
        this.errorMessage.set(userMessage);
        this.status.set('idle');
      }
      // ====================================================================
      // END: ENHANCED ERROR HANDLING BLOCK
      // ====================================================================
    });
  }
}