// src/app/features/employee/employee.routes.ts
import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./employee'),
    children: [
      {
        path: 'salaries',
        loadComponent: () => import('./pages/salary-list/salary-list'),
      },
      {
        path: 'salaries/:slipId',
        loadComponent: () => import('./pages/salary-slip-detail/salary-slip-detail'),
      },
      {
        path: '',
        redirectTo: 'salaries',
        pathMatch: 'full',
      },
      { path: '**', redirectTo: 'maintanence' },
    ],
  },
];