import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const authRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  
  const token = localStorage.getItem('auth_token_v1');
  const rolesString = localStorage.getItem('auth_roles_v1');

  if (token && rolesString) {
    try {
      const roles: string[] = JSON.parse(rolesString);
      
      if (Array.isArray(roles) && roles.length > 0) {
        const upperRoles = roles.map((r) => String(r).toUpperCase());
        
        // Instead of calling router.navigate(), create and return a UrlTree
        if (upperRoles.includes('ROLE_BANK_ADMIN')) {
          return router.parseUrl('/bank-admin'); // ✅ Return a UrlTree
        } else if (upperRoles.includes('ROLE_ORGANIZATION')) {
          return router.parseUrl('/org'); // ✅ Return a UrlTree
        } else if (upperRoles.includes('ROLE_EMPLOYEE')) {
          return router.parseUrl('/employee'); // ✅ Return a UrlTree
        } else {
          // Fallback redirect
          return router.parseUrl('/bank-admin'); // ✅ Return a UrlTree
        }
      }
    } catch (e) {
      console.error('Failed to parse roles from localStorage', e);
      localStorage.removeItem('auth_token_v1');
      localStorage.removeItem('auth_roles_v1');
      return true; // Corrupt data, allow navigation to login
    }
  }

  // No token found, allow navigation to the login page
  return true;
};