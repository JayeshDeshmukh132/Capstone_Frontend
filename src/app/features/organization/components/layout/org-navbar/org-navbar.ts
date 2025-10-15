import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-org-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm flex-shrink-0">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold" routerLink="/org">
        <i class="bi bi-building me-2"></i>Organization Portal
      </a>
      <!-- Note: data-bs-toggle requires Bootstrap JS in index.html to work -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#orgNavbar" aria-controls="orgNavbar" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="orgNavbar">
        <!-- Mobile Links -->
        <ul class="navbar-nav d-lg-none">
          <li class="nav-item">
            <a routerLink="/org" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Dashboard</a>
          </li>
          <li class="nav-item">
            <a routerLink="/org/employees" routerLinkActive="active" class="nav-link">Employees</a>
          </li>
          <li class="nav-item">
            <a routerLink="/org/bank-accounts" routerLinkActive="active" class="nav-link">Bank Accounts</a>
          </li>
          <li class="nav-item">
            <a routerLink="/org/clients-vendors" routerLinkActive="active" class="nav-link">Clients & Vendors</a>
          </li>
          <li class="nav-item">
            <a routerLink="/org/payment-requests" routerLinkActive="active" class="nav-link">Payment Requests</a>
          </li>
        </ul>
        <div class="ms-auto">
          <button (click)="logout()" class="btn btn-outline-light d-flex align-items-center">
            <i class="bi bi-box-arrow-right me-2"></i> Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
  `
})
export class OrgNavbar {
  private auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}