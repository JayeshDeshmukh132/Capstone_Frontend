import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guards';
import { authRedirectGuard } from './core/guards/auth-redirect.guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.default),
  },
  {
    path: 'org',
    loadChildren: () => import('./features/organization/organization.routes').then(m => m.organizationRoutes)
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
  loadChildren: () => import('./features/employee/employee.routes').then(m => m.EMPLOYEE_ROUTES),
  canActivate: [authGuard], // Protect this route
},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];