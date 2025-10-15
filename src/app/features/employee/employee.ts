// src/app/features/employee/employee-layout.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './employee.html',
  styles: `
    :host { display: block; height: 100vh; }
    .sidebar { width: 260px; flex-shrink: 0; }
    .main-content { overflow-y: auto; }
    .content-wrapper { background-color: #f8f9fa; flex-grow: 1; }
    .nav-link.active { font-weight: 500; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmployeeLayoutComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}