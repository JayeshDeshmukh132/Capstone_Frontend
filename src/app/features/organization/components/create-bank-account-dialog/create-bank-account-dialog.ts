import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizationService } from '../../../../core/services/organization.service';
import { BankAccountCreateRequest } from '../../../../core/model/bank-account.model';

@Component({
  selector: 'app-create-bank-account-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-bank-account-dialog.html',
  styleUrls: ['./create-bank-account-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateBankAccountDialogComponent {
  private fb = inject(FormBuilder);
  private orgService = inject(OrganizationService);
  @Output() closed = new EventEmitter<boolean>();

  status = signal<'idle' | 'submitting'>('idle');
  errorMessage = signal<string | null>(null);

  chequeFile = signal<File | null>(null);
  gstFile = signal<File | null>(null);

  // --- UPDATED Form Definition ---
  form = this.fb.group({
    accountNo: ['', [Validators.required, Validators.pattern('^[0-9]{9,18}$')]],
    ifscCode: ['', [Validators.required, Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]],
    branchName: ['', [Validators.required]],
    balance: [0, [Validators.required, Validators.min(0)]], // <-- RE-ADDED with validation
  });

  onFileSelected(event: Event, type: 'cheque' | 'gst'): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (type === 'cheque') this.chequeFile.set(file);
    if (type === 'gst') this.gstFile.set(file);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.chequeFile() || !this.gstFile()) {
      this.errorMessage.set('Both "Cancelled cheque" and "GST Certificate" documents are required.');
      return;
    }

    this.status.set('submitting');
    this.errorMessage.set(null);

    const request = this.form.value as BankAccountCreateRequest;

    this.orgService.createBankAccount(request, this.chequeFile()!, this.gstFile()!).subscribe({
      next: () => {
        this.close(true);
      },
      error: (err: HttpErrorResponse) => {
        const backendMessage = err.error?.message;
        if(err.status == 409){
          this.errorMessage.set(backendMessage || 'Bank account with similary number already exists')
        }else{
          this.errorMessage.set(err.error?.message || 'Failed to create bank account.');
        }
        this.status.set('idle');
      },
    });
  }

  close(shouldRefresh: boolean): void {
    this.closed.emit(shouldRefresh);
  }
}