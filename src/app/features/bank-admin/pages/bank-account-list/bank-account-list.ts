import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Custom Imports
import { BankAdminService } from '../../../../core/services/bank-admin.service';
import { BankAccountListItem, BankAccountStatus } from '../../../../core/model/model';

@Component({
  selector: 'app-bank-account-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bank-account-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BankAccountListComponent {
  orgId = input.required<string>(); // Get orgId from the route

  // ✅ ADD a regular class property to hold the ID safely
  currentOrgId: string = '';

  private readonly bankAdminService = inject(BankAdminService);
  private readonly location = inject(Location);
  private route = inject(ActivatedRoute);

  readonly state = signal<{
    accounts: BankAccountListItem[] | null;
    status: 'loading' | 'loaded' | 'error';
    error: string | null;
  }>({
    accounts: null,
    status: 'loading',
    error: null,
  });

  constructor() {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('orgId');
      if (id) {
        // ✅ SET the property once the input signal has a value
        this.currentOrgId = id;
        this.fetchBankAccounts(id);
      }
    });
  }

  fetchBankAccounts(orgId: string): void {
    this.state.set({ accounts: null, status: 'loading', error: null });
    this.bankAdminService.getBankAccountsForOrganization(Number(orgId)).subscribe({
      next: (accounts) => this.state.set({ accounts, status: 'loaded', error: null }),
      error: () => this.state.set({ accounts: null, status: 'error', error: 'Failed to load bank accounts.' }),
    });
  }

  goBack(): void {
    this.location.back();
  }

  getStatusBadgeClass(status: BankAccountStatus): string {
    switch (status) {
      case BankAccountStatus.ACTIVE: return 'bg-success';
      case BankAccountStatus.REJECTED: return 'bg-danger';
      case BankAccountStatus.PENDING: return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }
}