import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrganizationService } from '../../../../core/services/organization.service';
import { BankAccountDetails, BankAccountDocument } from '../../../../core/model/bank-account.model';

@Component({
  selector: 'app-bank-account-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bank-account-detail.html',
  styleUrls: ['./bank-account-detail.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankAccountDetailComponent {
  private route = inject(ActivatedRoute);
  private orgService = inject(OrganizationService);
  private accountId = Number(this.route.snapshot.paramMap.get('id'));

  // --- State Signal for Bank Account Details ---
  private accountState = signal<{
    details: BankAccountDetails | null;
    loading: boolean;
    error: string | null;
  }>({ details: null, loading: true, error: null });

  // --- State Signal for Documents ---
  private documentState = signal<{
    documents: BankAccountDocument[];
    loading: boolean;
    error: string | null;
  }>({ documents: [], loading: true, error: null });


  // --- Public Computed Signals for the Template ---
  readonly account = computed(() => this.accountState().details);
  readonly accountLoading = computed(() => this.accountState().loading);
  readonly accountError = computed(() => this.accountState().error);

  readonly documents = computed(() => this.documentState().documents);
  readonly documentsLoading = computed(() => this.documentState().loading);
  readonly documentsError = computed(() => this.documentState().error);


  constructor() {
    const orgId = localStorage.getItem('org_id');

    if (!orgId) {
      this.accountState.set({ details: null, loading: false, error: 'Organization ID not found.' });
      this.documentState.set({ documents: [], loading: false, error: 'Organization ID not found.' });
      return;
    }
    if (isNaN(this.accountId)) {
      this.accountState.set({ details: null, loading: false, error: 'Invalid Bank Account ID.' });
      this.documentState.set({ documents: [], loading: false, error: 'Invalid Bank Account ID.' });
      return;
    }

    // Initiate both API calls independently
    this.loadAccountDetails(orgId, this.accountId);
    this.loadDocuments(orgId, this.accountId);
  }

  private loadAccountDetails(orgId: string, accountId: number): void {
    this.orgService.getBankAccountDetails(orgId, accountId).subscribe({
      next: (details) => {
        this.accountState.set({ details, loading: false, error: null });
      },
      error: () => {
        this.accountState.set({ details: null, loading: false, error: 'Failed to load account details.' });
      }
    });
  }

  private loadDocuments(orgId: string, accountId: number): void {
    this.orgService.getDocumentsForBankAccount(orgId, accountId).subscribe({
      next: (documents) => {
        this.documentState.set({ documents, loading: false, error: null });
      },
      error: () => {
        this.documentState.set({ documents: [], loading: false, error: 'Failed to load associated documents.' });
      }
    });
  }
}