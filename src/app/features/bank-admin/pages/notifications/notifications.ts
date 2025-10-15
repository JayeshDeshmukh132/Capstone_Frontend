import {
  ChangeDetectionStrategy,
  Component,
  effect,
  signal,
  computed,
  AfterViewInit,
  ElementRef,
  viewChild,
  inject
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { BankAdminService } from '../../../../core/services/bank-admin.service';
import { NotificationStatus, Page, Notification as ApiNotification } from '../../../../core/model/model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './notifications.html',
  styles: `
    .list-group-item.read {
      background-color: #f8f9fa; /* Light grey for read notifications */
    }
    .toast-container {
      z-index: 1090; /* Ensure toast appears above other content */
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NotificationsComponent implements AfterViewInit {
  // ## Injected Services
  private readonly bankAdminService = inject(BankAdminService);

  // ## State Signals
  readonly state = signal<{
    page: Page<ApiNotification> | null;
    status: 'loading' | 'loaded' | 'error';
    error: string | null;
  }>({
    page: null,
    status: 'loading',
    error: null,
  });

  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly toastMessage = signal('');
  readonly toastIsError = signal(false);

  // ## Computed Signals
  readonly hasReadNotifications = computed(() =>
    this.state().page?.content.some(n => n.status === NotificationStatus.READ) ?? false
  );
  readonly hasUnreadNotifications = computed(() =>
    this.state().page?.content.some(n => n.status === NotificationStatus.UNREAD) ?? false
  );

  // ## Template Element References
  private notificationToastElement = viewChild.required<ElementRef<HTMLDivElement>>('notificationToast');
  private notificationToast?: bootstrap.Toast;

  // Expose enum to template
  readonly NotificationStatus = NotificationStatus;

  // ## Lifecycle Hooks
  constructor() {
    effect(() => {
      this.fetchNotifications(this.currentPage(), this.pageSize());
    });
  }

  ngAfterViewInit(): void {
    this.notificationToast = new bootstrap.Toast(this.notificationToastElement().nativeElement);
  }

  // ## Data Fetching
  fetchNotifications(page: number, size: number): void {
    this.state.update(s => ({ ...s, status: 'loading' }));
    this.bankAdminService.getNotifications(page, size).subscribe({
      next: (pageData) => this.state.set({ page: pageData, status: 'loaded', error: null }),
      error: () => this.state.set({ page: null, status: 'error', error: 'Failed to load notifications.' }),
    });
  }

  // ## Action Methods
  markOneAsRead(id: number): void {
    this.bankAdminService.markNotificationAsRead(id).subscribe({
      next: () => this.handleSuccess('Notification marked as read.'),
      error: (err) => this.handleError(err, 'Failed to mark as read.'),
    });
  }

  deleteOne(id: number): void {
    this.bankAdminService.deleteNotification(id).subscribe({
      next: () => this.handleSuccess('Notification deleted.'),
      error: (err) => this.handleError(err, 'Failed to delete notification.'),
    });
  }

  markAll(): void {
    this.bankAdminService.markAllNotificationsAsRead().subscribe({
      next: () => this.handleSuccess('All notifications marked as read.'),
      error: (err) => this.handleError(err, 'Failed to mark all as read.'),
    });
  }

  deleteAllRead(): void {
    this.bankAdminService.deleteAllReadNotifications().subscribe({
      next: () => this.handleSuccess('All read notifications deleted.'),
      error: (err) => this.handleError(err, 'Failed to delete read notifications.'),
    });
  }

  // ## Pagination Handlers
  handlePageSizeChange(event: Event): void {
    const newSize = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(newSize);
    this.currentPage.set(0);
  }

  handlePageChange(page: number): void {
    this.currentPage.set(page);
  }

  // ## Helper Functions
  private handleSuccess(message: string): void {
    this.fetchNotifications(this.currentPage(), this.pageSize());
    this.showToast(message);
  }

  private handleError(error: any, defaultMessage: string): void {
    const errorMessage = error.error?.message || defaultMessage;
    this.showToast(errorMessage, true);
  }

  private showToast(message: string, isError: boolean = false): void {
    this.toastMessage.set(message);
    this.toastIsError.set(isError);
    this.notificationToast?.show();
  }
}