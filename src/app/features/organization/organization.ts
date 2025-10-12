import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-organization',
  imports: [CommonModule, RouterModule],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class Organization {
  private auth = inject(AuthService);
  private router = inject(Router);

  // ✅ Ensure token is always a string or null, never undefined
  readonly token: string | null = this.auth.token ?? null;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
