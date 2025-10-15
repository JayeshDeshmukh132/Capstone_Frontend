import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizationService } from '../../../../core/services/organization.service';
import { ClientVendorCreateRequest, ClientVendorType } from '../../../../core/model/client-vendor.model';

@Component({
  selector: 'app-create-client-vendor-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-client-vendor-dialog.html',
  styleUrls: ['../create-bank-account-dialog/create-bank-account-dialog.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateClientVendorDialogComponent {
  private fb = inject(FormBuilder);
  private orgService = inject(OrganizationService);
  @Output() closed = new EventEmitter<boolean>();

  // Expose enum to the template for the radio buttons
  readonly ClientVendorType = ClientVendorType;

  status = signal<'idle' | 'submitting'>('idle');
  errorMessage = signal<string | null>(null);

  // FIX: Complete form with all fields and enhanced validators
  form = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100)
    ]],
    type: [ClientVendorType.CLIENT, [
      Validators.required
    ]],
    contactEmail: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(255)
    ]],
    contactPhone: ['', [
      Validators.required,
      Validators.pattern('^[0-9]{10}$') // Exactly 10 digits
    ]],
    accountNo: ['', [
      Validators.required,
      Validators.pattern('^[0-9]{9,18}$') // Numeric, 9 to 18 characters
    ]],
    ifscCode: ['', [
      Validators.required,
      Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$') // Standard Indian IFSC format, 11 chars
    ]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('submitting');
    this.errorMessage.set(null);

    const request = this.form.value as ClientVendorCreateRequest;

    this.orgService.createClientVendor(request).subscribe({
      next: () => this.close(true),
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.errorMessage.set(err.error?.message || 'A client/vendor with this name or account number already exists.');
        } else {
          this.errorMessage.set(err.error?.message || 'An unexpected error occurred.');
        }
        this.status.set('idle');
      },
    });
  }

  close(shouldRefresh: boolean): void {
    this.closed.emit(shouldRefresh);
  }
}