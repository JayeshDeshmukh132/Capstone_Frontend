import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
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