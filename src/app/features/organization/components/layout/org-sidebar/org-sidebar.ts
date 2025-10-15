import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-org-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  styleUrls: ['./org-sidebar.css'],
  template: `
    <div class="sidebar-header text-center">
      <h5 class="mb-0 fw-semibold">Organization Portal</h5>
    </div>
    <nav class="org-nav nav nav-pills flex-column gap-1">
      <!-- Note: Updated routerLinks to be absolute (/org/...) to ensure they work from any child route -->
      <a routerLink="/org" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
        <i class="bi bi-grid-1x2-fill"></i>
        <span>Dashboard</span>
      </a>
      <a routerLink="/org/employees" routerLinkActive="active-link" class="nav-link">
        <i class="bi bi-people-fill"></i>
        <span>Employees</span>
      </a>
      <a routerLink="/org/bank-accounts" routerLinkActive="active-link" class="nav-link">
        <i class="bi bi-wallet-fill"></i>
        <span>Bank Accounts</span>
      </a>
      <a routerLink="/org/clients-vendors" routerLinkActive="active-link" class="nav-link">
        <i class="bi bi-person-rolodex"></i>
        <span>Clients & Vendors</span>
      </a>
      <a routerLink="/org/payment-requests" routerLinkActive="active-link" class="nav-link">
        <i class="bi bi-send-check-fill"></i>
        <span>Payment Requests</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <button (click)="logout()" class="btn btn-outline-danger w-100">
        <i class="bi bi-box-arrow-right me-2"></i>Logout
      </button>
    </div>
  `
})
export class OrgSidebar {
  private auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}