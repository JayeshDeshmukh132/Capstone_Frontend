import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Material UI Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { BankAdminService } from '../../../../core/services/bank-admin.service';
import { Organization, OrganizationStatus } from '../../../../core/model/model';
import { UpdateStatusDialog } from '../update-status-dialog/update-status-dialog';

// Custom Imports
@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
  ],
  template: `
    <div class="detail-container">
      <a mat-stroked-button routerLink="/bank-admin/organizations">
        <mat-icon>arrow_back</mat-icon>
        Back to List
      </a>

      @switch (state().status) {
        @case ('loading') {
          <div class="centered-content">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        }
        @case ('error') {
          <div class="centered-content error-message">
            <h2>Error</h2>
            <p>{{ state().error }}</p>
          </div>
        }
        @case ('loaded') {
          @if (state().organization; as org) {
            <mat-card class="detail-card">
              <mat-card-header>
                <mat-card-title>{{ org.name }}</mat-card-title>
                <mat-card-subtitle>{{ org.email }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-list role="list">
                  <mat-list-item role="listitem">
                    <span matListItemTitle>Status</span>
                    <span matListItemLine>
                      <mat-chip [color]="getStatusColor(org.status)" selected>{{ org.status }}</mat-chip>
                    </span>
                  </mat-list-item>
                  <mat-list-item role="listitem">
                    <span matListItemTitle>Registration No.</span>
                    <span matListItemLine>{{ org.registrationNo || 'Not provided' }}</span>
                  </mat-list-item>
                  <mat-list-item role="listitem">
                    <span matListItemTitle>Address</span>
                    <span matListItemLine>{{ org.address || 'Not provided' }}</span>
                  </mat-list-item>
                   <mat-list-item role="listitem">
                    <span matListItemTitle>Verification Documents</span>
                    <span matListItemLine>
                      <a [href]="org.verificationDocsUrl" target="_blank" rel="noopener noreferrer">
                        View Documents
                      </a>
                    </span>
                  </mat-list-item>
                   <mat-list-item role="listitem">
                    <span matListItemTitle>Bank Admin Note</span>
                    <span matListItemLine>{{ org.note || 'No notes yet' }}</span>
                  </mat-list-item>
                </mat-list>
              </mat-card-content>
              @if (org.status === 'PENDING') {
                <mat-card-actions align="end">
                  <button mat-flat-button color="warn" (click)="openUpdateStatusDialog(OrganizationStatus.REJECTED)">
                    Reject
                  </button>
                  <button mat-flat-button color="primary" (click)="openUpdateStatusDialog(OrganizationStatus.APPROVED)">
                    Approve
                  </button>
                </mat-card-actions>
              }
            </mat-card>
          }
        }
      }
    </div>
  `,
  styles: [`
    .detail-container { padding: 2rem; }
    .detail-card { margin-top: 1rem; }
    .centered-content { display: grid; place-content: center; padding: 2rem; text-align: center; }
    .error-message { color: red; }
    a[mat-stroked-button] { margin-bottom: 1rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OrganizationDetailComponent {
  // 1. Get the organization ID from the route parameters
  id = input.required<string>();

  // 2. Inject dependencies
  private readonly bankAdminService = inject(BankAdminService);
   private route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // 3. Define component state with signals
  readonly OrganizationStatus = OrganizationStatus; // Make enum available in template
  readonly state = signal<{
    organization: Organization | null;
    status: 'loading' | 'loaded' | 'error';
    error: string | null;
  }>({
    organization: null,
    status: 'loading',
    error: null,
  });

   constructor() {
    // This effect is correctly written. It will run when 'id' is populated.
    effect(() => {
      const orgId = this.route.snapshot.paramMap.get('id');
      if (orgId) {
        this.fetchOrganization(orgId);
      }
    });
  }

  fetchOrganization(id: string): void {
    this.state.set({ organization: null, status: 'loading', error: null });

    // Perform the string-to-number conversion here
    const numericId = Number(id);

    this.bankAdminService.getOrganizationById(numericId).subscribe({
      next: (org) => {
        this.state.set({ organization: org, status: 'loaded', error: null });
      },
      error: (err) => {
        this.state.set({ organization: null, status: 'error', error: 'Failed to load organization details.' });
      },
    });
  }

  openUpdateStatusDialog(newStatus: OrganizationStatus): void {
    const organization = this.state().organization;
    if (!organization) return;

    // Use the consistently named dialog component
    const dialogRef = this.dialog.open(UpdateStatusDialog, {
      width: '400px',
      data: {
        organizationId: organization.id,
        organizationName: organization.name,
        newStatus: newStatus
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.snackBar.open('Organization status updated successfully!', 'Close', { duration: 3000 });
        // Refresh data using the valid string ID from the input
        this.fetchOrganization(this.id());
      }
    });
  }

  getStatusColor(status: OrganizationStatus): 'primary' | 'warn' | undefined {
    // ... (this method is correct)
    switch (status) {
      case OrganizationStatus.APPROVED: return 'primary';
      case OrganizationStatus.REJECTED: return 'warn';
      default: return undefined;
    }
  }
}