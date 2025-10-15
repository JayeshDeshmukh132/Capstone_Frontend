import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { OrganizationService } from '../../../../core/services/organization.service';
import { ClientVendorPage, ClientVendorType } from '../../../../core/model/client-vendor.model';
import { CreateClientVendorDialogComponent } from '../../components/create-client-vendor-dialog/create-client-vendor-dialog';

@Component({
  selector: 'app-client-vendor-list',
  standalone: true,
  imports: [CommonModule, CreateClientVendorDialogComponent],
  templateUrl: './client-vendor-list.html',
  styleUrls: ['./client-vendor-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientVendorListComponent {
  private orgService = inject(OrganizationService);

  readonly ClientVendorType = ClientVendorType;

  // --- State Signals ---
  private state = signal<{
    page: ClientVendorPage | null;
    loading: boolean;
    error: string | null;
  }>({ page: null, loading: true, error: null });

  // Public View Models
  readonly page = computed(() => this.state().page);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // --- Tab and Pagination State ---
  activeTab = signal<ClientVendorType>(ClientVendorType.CLIENT);
  currentPage = signal(0);
  pageSize = signal(10);
  
  isCreateDialogVisible = signal(false);
  
  constructor() {
    // Reactive effect: Re-fetch data whenever the tab or page changes
    effect(() => {
      this.fetchData();
    });
  }

  fetchData(): void {
    const orgId = localStorage.getItem('org_id');
    if (!orgId) {
      this.state.set({ page: null, loading: false, error: 'Organization ID not found.' });
      return;
    }
    
    this.state.update(s => ({ ...s, loading: true }));
    const currentTab = this.activeTab();
    
    this.orgService.getClientVendors(orgId, currentTab, this.currentPage(), this.pageSize()).subscribe({
      next: (pageData) => this.state.set({ page: pageData, loading: false, error: null }),
      error: () => this.state.set({ page: null, loading: false, error: `Failed to load ${currentTab.toLowerCase()}s.` }),
    });
  }

  setActiveTab(type: ClientVendorType): void {
    if (this.activeTab() === type) return;
    this.currentPage.set(0);
    this.activeTab.set(type);
  }

  handlePageChange(pageIndex: number): void {
    this.currentPage.set(pageIndex);
  }
  
  onDialogClosed(shouldRefresh: boolean): void {
    this.isCreateDialogVisible.set(false);
    if (shouldRefresh) {
      this.fetchData();
    }
  }
}