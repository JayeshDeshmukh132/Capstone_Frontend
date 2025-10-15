import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, TitleCasePipe, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrganizationService } from '../../../../core/services/organization.service';
import { PaymentRequestPage, PaymentRequestSummary, PaymentType } from '../../../../core/model/payment-request.model';
import { PaymentRequestDetailDialogComponent } from "../../components/payment-request-detail-dialog/payment-request-detail-dialog";

@Component({
  selector: 'app-payment-request-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TitleCasePipe, CurrencyPipe, DatePipe, PaymentRequestDetailDialogComponent],
  templateUrl: './payment-request-list.html',
  styleUrls: ['./payment-request-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentRequestListComponent {
  private orgService = inject(OrganizationService);
  readonly PaymentType = PaymentType;

  // --- State Signals ---
  private allRequests = signal<PaymentRequestSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedRequestId = signal<number | null>(null);


  activeTab = signal<PaymentType>(PaymentType.DEPOSIT);
  currentPage = signal(0);
  pageSize = signal(10);
  
  private filteredRequests = computed(() => {
    const all = this.allRequests();
    const tab = this.activeTab();
    return all.filter(req => req.paymentType === tab);
  });


  readonly page = computed(() => {
    const filtered = this.filteredRequests();
    const pageIndex = this.currentPage();
    const size = this.pageSize();

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = pageIndex * size;
    
    const content = filtered.slice(startIndex, startIndex + size);


    return {
      content,
      totalElements,
      totalPages,
      number: pageIndex,
      size: size,
      first: pageIndex === 0,
      last: pageIndex >= totalPages - 1,
    } as PaymentRequestPage;
  });
  
  constructor() {
    this.fetchAllData();
  }

  fetchAllData(): void {
    const orgId = localStorage.getItem('org_id');
    if (!orgId) {
      this.error.set('Organization ID not found.');
      this.loading.set(false);
      return;
    }
    
    this.loading.set(true);
    
  
    this.orgService.getAllPaymentRequests(orgId).subscribe({
      next: (pageData) => {
        this.allRequests.set(pageData.content); // Store the master list
        this.loading.set(false);
        this.error.set(null);
      },
      error: () => {
        this.error.set(`Failed to load payment requests.`);
        this.loading.set(false);
      },
    });
  }
  setActiveTab(type: PaymentType): void {
    if (this.activeTab() === type) return;
    this.currentPage.set(0); // Reset to the first page when switching tabs
    this.activeTab.set(type);
  }

  handlePageChange(pageIndex: number): void {
    this.currentPage.set(pageIndex);
  }

  viewDetails(requestId: number): void {
    this.selectedRequestId.set(requestId);
  }

  onDialogClosed(): void {
    this.selectedRequestId.set(null);
  }
}