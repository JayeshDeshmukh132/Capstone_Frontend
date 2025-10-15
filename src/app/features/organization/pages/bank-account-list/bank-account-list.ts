import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrganizationService } from '../../../../core/services/organization.service';
import { BankAccountSummary } from '../../../../core/model/bank-account.model';
import { CreateBankAccountDialogComponent } from '../../components/create-bank-account-dialog/create-bank-account-dialog';

@Component({
  selector: 'app-bank-account-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CreateBankAccountDialogComponent],
  templateUrl: './bank-account-list.html',
  styleUrls: ['./bank-account-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankAccountListComponent {
  private orgService = inject(OrganizationService);

  private state = signal<{
    accounts: BankAccountSummary[];
    loading: boolean;
    error: string | null;
  }>({
    accounts: [],
    loading: true,
    error: null,
  });

  readonly accounts = computed(() => this.state().accounts);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  isCreateDialogVisible = signal(false);

  constructor() {
    this.fetchAccounts();
  }

  fetchAccounts(): void {
    // --- UPDATED LOGIC ---
    // 1. Get the organization ID from localStorage
    const orgId = localStorage.getItem('org_id'); // Make sure this is the correct key

    if (!orgId) {
      this.state.set({ accounts: [], loading: false, error: 'Organization ID not found. Please log in again.' });
      return;
    }

    this.state.update(s => ({ ...s, loading: true }));
    
    // 2. Pass the ID to the service method
    this.orgService.getBankAccounts(orgId).subscribe({
      next: (accounts) => this.state.set({ accounts, loading: false, error: null }),
      error: () => this.state.set({ accounts: [], loading: false, error: 'Failed to load bank accounts.' }),
    });
  }

  onDialogClosed(shouldRefresh: boolean): void {
    this.isCreateDialogVisible.set(false);
    if (shouldRefresh) {
      this.fetchAccounts();
    }
  }
}