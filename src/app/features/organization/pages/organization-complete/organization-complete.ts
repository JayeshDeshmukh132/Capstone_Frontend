// src/app/features/organization/pages/organization-complete/organization-complete.ts
import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Organization } from '../../../../core/model/model'; // Adjust path as needed
import { OrganizationService } from '../../../../core/services/organization.service';
import { DocumentResponse } from '../../../../core/model/document.model'; // Adjust path as needed
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { OrganizationRegistrationCompleteResponse } from '../../../../core/model/organization.model';

@Component({
  selector: 'app-organization-complete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './organization-complete.html',
  styleUrls: ['./organization-complete.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationCompleteComponent {
  private route = inject(ActivatedRoute);
  private service = inject(OrganizationService);
  private fb = inject(FormBuilder);
  router = inject(Router);

  // UI signals
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null); // For general form errors
  private orgSignal = signal<Organization | null>(null);
  private docsSignal = signal<DocumentResponse[]>([]);
  private uploadErrorsSignal = signal<{ [key: string]: string } | null>(null);

  // New signal for managing the alert popup
  private alertSignal = signal({ visible: false, message: '', type: 'alert-success' });

  // existing doc slots (display purposes only)
  private existingIncorporation = signal<DocumentResponse | null | undefined>(null);
  private existingTax = signal<DocumentResponse | null | undefined>(null);
  private existingAddress = signal<DocumentResponse | null | undefined>(null);

  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly organization = computed(() => this.orgSignal());
  readonly incDoc = computed(() => this.existingIncorporation());
  readonly taxDoc = computed(() => this.existingTax());
  readonly addrDoc = computed(() => this.existingAddress());
  readonly uploadErrors = computed(() => this.uploadErrorsSignal());
  readonly alert = computed(() => this.alertSignal());

  // file slots (new uploads)
  incorporationFile = signal<File | null>(null);
  taxFile = signal<File | null>(null);
  addressProofFile = signal<File | null>(null);

  readonly form = this.fb.group({
    registrationNo: [{ value: '', disabled: false }, [Validators.required]],
    address: ['', [Validators.required]],
  });

  constructor() {
    const orgId = localStorage.getItem('org_id');
    if (!orgId) {
      this.showAlert('Organization ID not found. Please log in again.', 'danger');
      return;
    }
    this.loadOrganization(orgId);
  }

  // --- Alert Management ---
  showAlert(message: string, type: 'success' | 'warning' | 'danger'): void {
    const alertTypeClass = `alert-soft-${type}`;
    this.alertSignal.set({ visible: true, message, type: alertTypeClass });
    // REMOVED: setTimeout to make the alert persistent
  }

  hideAlert(): void {
    this.alertSignal.update((a) => ({ ...a, visible: false }));
  }


  private loadOrganization(orgId: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.orgSignal.set(null);
    this.hideAlert();

    this.service.getOrganization(orgId).subscribe({
      next: (res) => {
        this.loadingSignal.set(false);
        this.orgSignal.set(res);

        if (res?.registrationNo) {
          this.form.controls.registrationNo.setValue(res.registrationNo);
          this.form.controls.registrationNo.disable();
        }
        if (res?.address) {
          this.form.controls.address.setValue(res.address);
        }
        this.loadDocuments();
      },
      error: (err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        this.showAlert(err.error?.message || 'Failed to load organization details.', 'danger');
      },
    });
  }

  private loadDocuments(): void {
    this.service.getDocuments().subscribe({
      next: (docs) => {
        this.docsSignal.set(Array.isArray(docs) ? docs : []);
        this.mapDocsToSlots(docs ?? []);
      },
      error: () => {
        this.showAlert('Could not load existing document information.', 'warning');
      },
    });
  }

  private mapDocsToSlots(docs: DocumentResponse[]): void {
    const lower = (s?: string) => (s ?? '').toString().toLowerCase();
    const findByKeywords = (keywords: string[]) =>
      docs.find((d) => keywords.some((k) => lower(d.displayName).includes(k) || lower(d.originalName).includes(k)));

    this.existingIncorporation.set(findByKeywords(['incorporation', 'incorporationcertificate']));
    this.existingTax.set(findByKeywords(['tax', 'taxdocument']));
    this.existingAddress.set(findByKeywords(['address', 'addressproof']));
  }

  // --- File Selection Handlers ---
  onIncorporationSelected(ev: Event): void {
    this.incorporationFile.set(this._getFileFromEvent(ev));
  }
  onTaxSelected(ev: Event): void {
    this.taxFile.set(this._getFileFromEvent(ev));
  }
  onAddressProofSelected(ev: Event): void {
    this.addressProofFile.set(this._getFileFromEvent(ev));
  }

  private _getFileFromEvent(ev: Event): File | null {
    const input = ev.target as HTMLInputElement | null;
    return input?.files?.[0] || null;
  }

  // --- Form Submission ---
  onSubmit(): void {
    this.hideAlert(); // Hide previous alerts before new submission
    this.errorSignal.set(null); // Clear form-level errors

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorSignal.set('Please fill in all required text fields.');
      return;
    }

    // Check for mandatory files
    if (!this.incorporationFile() && !this.existingIncorporation()) {
        this.errorSignal.set('Incorporation Certificate is a required document.');
        return;
    }
    if (!this.taxFile() && !this.existingTax()) {
        this.errorSignal.set('Tax Document is a required document.');
        return;
    }
    if (!this.addressProofFile() && !this.existingAddress()) {
        this.errorSignal.set('Address Proof is a required document.');
        return;
    }


    const orgId = this.organization()?.id;
    if (!orgId) {
      this.showAlert('Organization ID is missing. Cannot submit.', 'danger');
      return;
    }

    // --- Build FormData ---
    const formData = new FormData();
    const details = {
      registrationNo: this.form.getRawValue().registrationNo,
      address: this.form.value.address,
    };
    formData.append('details', JSON.stringify(details));

    if (this.incorporationFile()) formData.append('incorporationCertificate', this.incorporationFile()!);
    if (this.taxFile()) formData.append('taxDocument', this.taxFile()!);
    if (this.addressProofFile()) formData.append('addressProof', this.addressProofFile()!);

    this.loadingSignal.set(true);

    this.service.completeRegistration(orgId, formData).subscribe({
      next: (response: OrganizationRegistrationCompleteResponse) => {
        this.loadingSignal.set(false);
        
        const hasErrors = response.uploadErrors && Object.keys(response.uploadErrors).length > 0;
        if (hasErrors) {
            this.uploadErrorsSignal.set(response.uploadErrors);
            this.showAlert('Details saved, but some documents failed to upload. Please review.', 'warning');
        } else {
            this.showAlert('Details submitted successfully! The bank admin will review your application.', 'success');
            setTimeout(() => this.router.navigate(['/org']), 2500); // Allow time to read success message
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        console.error('Submission failed', err);

        const backendMessage = err.error?.message;
        if (err.status === 409) { // Conflict
          this.showAlert(backendMessage || 'This registration number is already in use.', 'danger');
        } else if (err.status === 400) { // Bad Request
          this.showAlert(backendMessage || 'Invalid data submitted. Please check your inputs.', 'danger');
        } else {
          this.showAlert('An unexpected server error occurred. Please try again later.', 'danger');
        }
      },
    });
  }
}