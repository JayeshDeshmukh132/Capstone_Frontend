import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guards'; // adjust path if your guard is elsewhere
import { Organization } from './organization';


export const organizationRoutes: Routes = [
  {
    path: '',
    component: Organization,
    canActivate: [authGuard],
    data: { roles: ['ROLE_ORGANIZATION'] },
    children: [
      {
        // Redirect the base '/org' path to a default page, like the employee list
        path: '',
        redirectTo: 'employees',
        pathMatch: 'full'
      },
      {
        path: 'employees',
        loadComponent: () => import('./pages/employee-list/employee-list').then(m => m.EmployeeList),
      },
      {
        path: 'employees/new',
        loadComponent: () => import('./pages/create-employee/create-employee').then(m => m.CreateEmployee),
      },
      {
        path: 'employees/:id/edit',
        loadComponent: () => import('./pages/update-employee/update-employee').then(m => m.UpdateEmployee),
      },
      {
        path: 'employees/upload',
        loadComponent: () => import('./pages/upload-employees-page/upload-employees-page').then(m => m.UploadEmployeesPageComponent),
      },
      {
        path: 'complete-registration',
        loadComponent: () =>
          import('./pages/organization-complete/organization-complete').then(m => m.OrganizationCompleteComponent),
      },
      {
        path: 'bank-accounts',
        loadComponent: () => import('./pages/bank-account-list/bank-account-list').then(m => m.BankAccountListComponent),
      },
      {
        path: 'bank-accounts/:id', // The ID of the specific bank account
        loadComponent: () => import('./pages/bank-account-detail/bank-account-detail').then(m => m.BankAccountDetailComponent),
      },
      {
        path: 'employees',
        loadComponent: () => import('./pages/employee-list/employee-list').then(m => m.EmployeeList),
      },
      {
        path: 'clients-vendors',
        loadComponent: () => import('./pages/client-vendor-list/client-vendor-list').then(m => m.ClientVendorListComponent),
      },
      {
        path: 'payment-requests',
        loadComponent: () => import('./pages/payment-request-list/payment-request-list').then(m => m.PaymentRequestListComponent),
      },
      {
        path: 'payment-requests/new-deposit',
        loadComponent: () => import('./pages/create-deposit-request/create-deposit-request').then(m => m.CreateDepositRequestComponent),
      },
      {
        path: 'payment-requests/new-vendor',
        loadComponent: () => import('./pages/create-vendor-payment/create-vendor-payment').then(m => m.CreateVendorPaymentComponent),
      },
      {
        path: 'payment-requests/new-salary',
        loadComponent: () => import('./pages/create-salary-payment/create-salary-payment').then(m => m.CreateSalaryPaymentComponent),
      },
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },
];
