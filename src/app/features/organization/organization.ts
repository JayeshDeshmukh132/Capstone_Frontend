import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { OrganizationService } from '../../core/services/organization.service';

import { OrganizationResponse, OrganizationStatus } from '../../core/model/organization.model';

@Component({
  selector: 'app-organization',
  imports: [CommonModule, RouterModule],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class Organization {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(OrganizationService);

  readonly token: string | null = this.auth.token ?? null;

  // UI state signals
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private orgSignal = signal<OrganizationResponse | null>(null);

  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly organization = computed(() => this.orgSignal());

  constructor() {
    const routeId = this.route.snapshot.paramMap.get('id');
    const stored = localStorage.getItem('org_id');
    const orgId = routeId ?? stored;
    if (!orgId) {
      this.errorSignal.set('Organization id not found. Please open this page with organization id.');
      return;
    }

    this.loadAndRedirectIfNeeded(orgId);
  }

  private loadAndRedirectIfNeeded(orgId: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.orgSignal.set(null);

    this.service.getOrganization(orgId).subscribe({
      next: (res: OrganizationResponse) => {
        console.debug('Loaded organization:', res);
        this.loadingSignal.set(false);
        this.orgSignal.set(res);

        const status = (res?.status ?? '').toString().toUpperCase() as OrganizationStatus | string;
        console.debug('Organization status (uppercased):', status);
        // If PENDING -> navigate to complete-registration page
        if (status === OrganizationStatus.PENDING || status === 'PENDING') {
          // keep org_id in storage for the complete page to use
          try { localStorage.setItem('org_id', String(orgId)); } catch {}
          this.router.navigate(['complete-registration'], { relativeTo: this.route });

          return;
        }

        // If APPROVED/ACTIVE -> stay on this page (dashboard)
        if (status === OrganizationStatus.APPROVED || status === 'APPROVED' || status === 'ACTIVE') {
          // nothing to do, organization data is already set for view
          return;
        }

        // For other statuses, you may choose to show message; we show current status
      },
      error: (err) => {
        this.loadingSignal.set(false);
        console.error('Failed loading organization', err);
        this.errorSignal.set('Failed to load organization details.');
      }
    });
  }
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
