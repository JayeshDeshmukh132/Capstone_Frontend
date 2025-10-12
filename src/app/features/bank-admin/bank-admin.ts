// src/app/features/bank-admin/bank-admin-layout.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-bank-admin',
  standalone: true,
  imports: [
    // Router Modules
    RouterOutlet,
    RouterLink,
    RouterLinkActive,

    // Material UI Modules
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: 'bank-admin.html',
  styleUrl:'bank-admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BankAdmin {
  private readonly router = inject(Router);

  logout(): void {
    
    localStorage.removeItem('auth_token_v1'); 
    localStorage.removeItem('auth_roles_v1'); 
    //Redirect to the login page
    this.router.navigate(['/login']);
  }
}