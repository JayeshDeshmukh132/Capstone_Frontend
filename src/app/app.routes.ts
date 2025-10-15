import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guards';
import { authRedirectGuard } from './core/guards/auth-redirect.guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login'),
    canActivate: [authRedirectGuard],
  },
  {
    path: 'org',
    loadComponent: () => import('./features/organization/organization').then((m) => m.Organization),
    canActivate: [authGuard],
    data: { roles: ['ROLE_ORGANIZATION'] },
  },
  {
    path: 'bank-admin',
    // Make sure this name matches the exported const in the routes file
    loadChildren: () =>
      import('./features/bank-admin/bank-admin.routes').then((m) => m.BANK_ADMIN_ROUTES),
      canActivate: [authGuard],
  },
  {
    path: 'employee',
    loadComponent: () => import('./features/employee/employee').then((m) => m.Employee),
     canActivate: [authGuard],
    data: { roles: ['ROLE_EMPLOYEE'] },
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];