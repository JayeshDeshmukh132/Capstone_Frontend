// src/app/features/bank-admin/bank-admin.routes.ts
import { Routes } from '@angular/router';

export const BANK_ADMIN_ROUTES: Routes = [
  {
    path: '',
    // A layout/shell component for the admin section
    loadComponent: () => import('./bank-admin'),
    children: [
      {
        path: 'organizations',
        loadComponent: () => import('./pages/organization-list/organization-list'),
      },
      {
        path: 'organizations/:id',
        loadComponent: () => import('./pages/organization-detail/organization-detail'),
      },
    //   {
    //     path: 'notifications',
    //     loadComponent: () => import('./pages/notifications/notifications.component'),
    //   },
    //   {
    //     path: 'settings',
    //     loadComponent: () => import('./pages/settings/settings.component'),
    //   },
      {
        path: '',
        redirectTo: 'organizations',
        pathMatch: 'full',
      },
    ],
  },
];