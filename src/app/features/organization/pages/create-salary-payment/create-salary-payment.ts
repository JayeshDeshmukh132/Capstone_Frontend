import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizationService } from '../../../../core/services/organization.service';
import { BankAccountSummary } from '../../../../core/model/bank-account.model';
import { BulkUploadResponse } from '../../../../core/model/bulk-upload.model';

@Component({
  selector: 'app-create-salary-payment',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './create-salary-payment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSalaryPaymentComponent {
  private router = inject(Router);
  private orgService = inject(OrganizationService);

  // --- UI State Signals ---
  // 'result' state will show the upload summary
  status = signal<'loading-data' | 'idle' | 'submitting' | 'result'>('loading-data');
  errorMessage = signal<string | null>(null);
  
  // --- Data Signals ---
  bankAccounts = signal<BankAccountSummary[]>([]);
  selectedFile = signal<File | null>(null);
  uploadResult = signal<BulkUploadResponse | null>(null);

  // --- Form Controls ---
  selectedAccount = new FormControl<number | null>(null, [Validators.required]);

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
      },
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
    // When a new file is selected, reset any previous results
    this.status.set('idle');
    this.errorMessage.set(null);
    this.uploadResult.set(null);
  }

  downloadFormat(): void {
    this.orgService.downloadSalaryCsvFormat().subscribe({
      next: (blob) => { /* ... download logic ... */ },
      error: () => this.errorMessage.set('Could not download the salary format file.'),
    });
  }

  processFile(): void {
    // Validate that an account and a file are selected
    if (this.selectedAccount.invalid) {
      this.selectedAccount.markAsTouched();
      return;
    }
    const file = this.selectedFile();
    const accountId = this.selectedAccount.value;
    const orgId = localStorage.getItem('org_id');

    if (!file || !accountId || !orgId) {
      this.errorMessage.set('Please select a source account and a CSV file to process.');
      return;
    }

    this.status.set('submitting');
    this.errorMessage.set(null);
    this.uploadResult.set(null);

    this.orgService.uploadSalariesFromCsv(orgId, accountId, file).subscribe({
      next: (response) => {
        this.uploadResult.set(response);
        this.status.set('result'); // Move to the result view
      },
      error: (err: HttpErrorResponse) => {
        // Handle global errors like inactive account
        this.errorMessage.set(err.error?.message || 'An unexpected error occurred during processing.');
        this.status.set('idle');
      },
    });
  }
  
  processAnother(): void {
    this.status.set('idle');
    this.selectedFile.set(null);
    this.uploadResult.set(null);
    this.errorMessage.set(null);
    // Clear the file input visually
    const fileInput = document.getElementById('salaryFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}