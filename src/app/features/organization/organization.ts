import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { OrganizationResponse, OrganizationStatus } from '../../core/model/organization.model';

// Import new layout components
import { OrgNavbar } from './components/layout/org-navbar/org-navbar';
import { OrgSidebar } from './components/layout/org-sidebar/org-sidebar';

@Component({
  selector: 'app-organization',
  standalone: true,
  // Add new components to imports
  imports: [CommonModule, RouterModule, OrgNavbar, OrgSidebar],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class Organization {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(OrganizationService);

  // UI state signals for initial data load
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  // Kept just in case child components need it via a service later, 
  // though currently not strictly used in template
  private orgSignal = signal<OrganizationResponse | null>(null); 

  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  constructor() {
    // Logic to ensure Org ID exists and Org is active
    const routeId = this.route.snapshot.paramMap.get('id');
    const stored = localStorage.getItem('org_id');
    const orgId = routeId ?? stored;

    if (!orgId) {
      this.errorSignal.set('Organization ID not found. Please log in again.');
      return;
    }

    this.loadAndRedirectIfNeeded(orgId);
  }

  private loadAndRedirectIfNeeded(orgId: string): void {
    // Don't reload if we are already on the complete-registration page to avoid loops
    if (this.router.url.includes('complete-registration')) {
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.service.getOrganization(orgId).subscribe({
      next: (res: OrganizationResponse) => {
        this.loadingSignal.set(false);
        this.orgSignal.set(res);

        // Ensure ID is in local storage for child pages
        try { localStorage.setItem('org_id', String(res.id)); } catch {}

        const status = (res?.status ?? '').toString().toUpperCase();
        
        // Redirect logic based on status
        if (status === OrganizationStatus.PENDING || status === 'PENDING') {
          this.router.navigate(['/org/complete-registration']);
        } else if (status === OrganizationStatus.REJECTED || status === 'REJECTED' || status === 'INACTIVE') {
           this.errorSignal.set(`Organization account is ${status}. Access restricted.`);
        }
        // If APPROVED/ACTIVE, stay here and render child routes
      },
      error: (err) => {
        this.loadingSignal.set(false);
        console.error('Failed loading organization', err);
        this.errorSignal.set('Failed to load organization details. Please check your connection.');
      }
    });
  }
}