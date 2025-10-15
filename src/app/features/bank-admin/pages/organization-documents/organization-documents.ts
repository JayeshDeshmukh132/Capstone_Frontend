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
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';

// Custom Application Imports
import { BankAdminService } from '../../../../core/services/bank-admin.service';
import { OrganizationDocument, DocumentStatus } from '../../../../core/model/model';

@Component({
  selector: 'app-organization-documents',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './organization-documents.html',
  styles: `
    .toast-container {
      z-index: 1090;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrganizationDocumentsComponent implements AfterViewInit {
  // ## Injected Services
  private readonly bankAdminService = inject(BankAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly location = inject(Location);
  private route = inject(ActivatedRoute);


  // ## Route Input
  id = input.required<string>();

  // ## Component State
  readonly state = signal<{
    documents: OrganizationDocument[] | null;
    status: 'loading' | 'loaded' | 'error';
    error: string | null;
  }>({
    documents: null,
    status: 'loading',
    error: null,
  });

  // ## State for the Update Modal
  readonly selectedDocument = signal<OrganizationDocument | null>(null);
  readonly newStatus = signal<DocumentStatus | null>(null);

  // ## State for the Toast Notification
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

  readonly DocumentStatus = DocumentStatus;

  // ## Lifecycle Hooks
  constructor() {
    effect(() => {
      const orgId = this.route.snapshot.paramMap.get('id');
      if (orgId) {
        this.fetchDocuments(orgId);
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateModal = new bootstrap.Modal(this.updateModalElement().nativeElement);
    this.notificationToast = new bootstrap.Toast(this.notificationToastElement().nativeElement);
  }

  // ## Data Fetching
  fetchDocuments(orgId: string): void {
    this.state.set({ documents: null, status: 'loading', error: null });
    this.bankAdminService.getDocumentsForOrganization(Number(orgId)).subscribe({
      next: (docs) => this.state.set({ documents: docs, status: 'loaded', error: null }),
      error: () => this.state.set({ documents: null, status: 'error', error: 'Failed to load documents.' }),
    });
  }

  // ## Event Handlers
  openDialog(doc: OrganizationDocument, status: DocumentStatus): void {
    this.selectedDocument.set(doc);
    this.newStatus.set(status);

    this.updateForm.reset({ note: doc.note || '' });
    if (status === DocumentStatus.REJECTED) {
      this.updateForm.controls.note.setValidators(Validators.required);
    } else {
      this.updateForm.controls.note.clearValidators();
    }
    this.updateForm.controls.note.updateValueAndValidity();
    
    this.updateModal?.show();
  }

  submitUpdate(): void {
    if (this.updateForm.invalid || !this.selectedDocument() || !this.newStatus()) {
      return;
    }
    
    this.updateModal?.hide();
    this.showToast('Updating document status...', false);

    const doc = this.selectedDocument()!;
    const status = this.newStatus()!;
    const note = this.updateForm.value.note ?? '';

    this.bankAdminService.updateDocumentStatus(doc.id, status, note).subscribe({
      next: () => {
        const Id = this.route.snapshot.paramMap.get('id');
        if(Id)
          this.fetchDocuments(Id);
        this.showToast('Document status updated successfully!');
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Failed to update status. Please try again.';
        this.showToast(errorMessage, true);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  // ## Helper Functions
  private showToast(message: string, isError: boolean = false): void {
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    this.notificationToast?.show();
  }

  getStatusBadgeClass(status: DocumentStatus): string {
    switch (status) {
      case DocumentStatus.APPROVED: return 'bg-success';
      case DocumentStatus.REJECTED: return 'bg-danger';
      case DocumentStatus.PENDING: return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }
}