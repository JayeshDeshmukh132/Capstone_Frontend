import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { parseJwt } from '../utils/jwt.helper';

type LoginResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  roles?: string[] | string;
  data?: { token?: string; roles?: string[] | string } | unknown;
  [k: string]: unknown;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // keys in localStorage
  private readonly tokenKey = 'auth_token_v1';
  private readonly rolesKey = 'auth_roles_v1';

  // reactive signals storing the in-memory state
  private tokenSignal = signal<string | null>(localStorage.getItem(this.tokenKey));
  private rolesSignal = signal<string[]>(this._readRolesFromStorage());

  readonly isLoggedIn = computed(() => !!this.tokenSignal());
  readonly primaryRole = computed(() => this.rolesSignal()[0] ?? null);

  private _readRolesFromStorage(): string[] {
    try {
      const raw = localStorage.getItem(this.rolesKey);
      return raw ? JSON.parse(raw) as string[] : [];
    } catch {
      return [];
    }
  }

  login(email: string, password: string): Observable<{ success: boolean; roles: string[] }> {
  const url = `${environment.apiUrl}/auth/login`;
  return this.http.post<LoginResponse>(url, { email, password }).pipe(
    map(res => {
      const token = (res?.token || res?.accessToken || res?.jwt ||
        (res?.data && (res.data as any).token)) as string | undefined;

      if (!token) {
        return { success: false, roles: [] };
      }

      // persist token
      localStorage.setItem(this.tokenKey, token);
      this.tokenSignal.set(token);

      // 1) Check explicit single-role field returned by your backend: res.role
      let roles: string[] = [];
      const maybeSingleRole = (res as any)?.role as string | undefined;
      if (maybeSingleRole) {
        // backend returns role without "ROLE_" prefix; normalize to full form
        const normalized = maybeSingleRole.startsWith('ROLE_') ? maybeSingleRole : `ROLE_${maybeSingleRole}`;
        roles = [normalized.toUpperCase()];
      }

      // 2) Also check explicit 'roles' returned in response (could be array or string)
      const maybeRoles = (res?.roles || (res?.data && (res.data as any).roles)) as string[] | string | undefined;
      if ((!roles || roles.length === 0) && maybeRoles) {
        roles = Array.isArray(maybeRoles) ? maybeRoles.map(String) : [String(maybeRoles)];
      }

      // 3) If still empty, decode JWT payload and try various claim shapes
      if (!roles || roles.length === 0) {
        const payload = parseJwt(token) as any | null;
        if (payload) {
          // payload.roles could be:
          // - array of strings: ["ROLE_X"]
          // - array of objects: [{authority: 'ROLE_X'}] OR [{role: 'ROLE_X'}]
          // - payload.authorities similar
          if (Array.isArray(payload.roles)) {
            roles = payload.roles.map((r: any) => {
              if (typeof r === 'string') return r;
              if (r && typeof r === 'object') return String(r.authority ?? r.role ?? JSON.stringify(r));
              return String(r);
            });
          } else if (Array.isArray(payload.authorities)) {
            roles = payload.authorities.map((r: any) => {
              if (typeof r === 'string') return r;
              if (r && typeof r === 'object') return String(r.authority ?? r.role ?? JSON.stringify(r));
              return String(r);
            });
          } else if (payload.realm_access && Array.isArray(payload.realm_access.roles)) {
            roles = payload.realm_access.roles.map(String);
          }
        }
      }

      // Normalize to uppercase and ensure "ROLE_" prefix where applicable
      roles = roles
        .filter(Boolean)
        .map(r => String(r).toUpperCase())
        .map(r => (r.startsWith('ROLE_') ? r : `ROLE_${r}`));

      // store roles
      try { localStorage.setItem(this.rolesKey, JSON.stringify(roles)); } catch { /* ignore */ }
      this.rolesSignal.set(roles);

      return { success: true, roles };
    })
  );
}


  logout(): void {
    this.tokenSignal.set(null);
    this.rolesSignal.set([]);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rolesKey);
  }

  get token(): string | null {
    return this.tokenSignal();
  }

  get roles(): string[] {
    return this.rolesSignal();
  }

  // helper to check if user has a particular role (case-insensitive)
  hasRole(match: string): boolean {
    const normalized = match.toUpperCase();
    return this.rolesSignal().some(r => String(r).toUpperCase().includes(normalized));
  }
}
