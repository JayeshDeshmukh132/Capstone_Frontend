import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Usage in route: { path: 'org', loadComponent: ..., canActivate: [authGuard], data: { roles: ['ORG'] } }
 *
 * - If route.data.roles is present, guard checks user has at least one of those roles (case-insensitive substring match).
 * - If not logged in, guard redirects to /login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const loggedIn = auth.isLoggedIn();
  if (!loggedIn) {
    // not logged in -> redirect to login (preserve return url)
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const requiredRoles = (route.data?.['roles'] ?? []) as string[];
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // normalize and check
  const normalizedRequired = requiredRoles.map(r => String(r).toUpperCase());
  const hasOne = normalizedRequired.some(req => auth.roles.some(userR => String(userR).toUpperCase().includes(req)));

  if (hasOne) return true;

  // logged in but not authorized -> redirect to login (or could be an 'access denied' page)
  return router.createUrlTree(['/login']);
};
