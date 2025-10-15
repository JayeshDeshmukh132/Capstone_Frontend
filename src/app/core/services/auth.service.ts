import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { parseJwt } from '../utils/jwt.helper';
import { jwtDecode } from 'jwt-decode';

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

      // ---  STORE ORGANIZATION ID (if present) ---
      // backend might return it directly, e.g., res.organizationId or res.id
      const maybeOrgId = (res as any)?.organizationId ?? (res as any)?.id ?? null;
      if (maybeOrgId) {
        try { localStorage.setItem('org_id', String(maybeOrgId)); } catch { /* ignore */ }
      }

      // --- 1) Parse role from response ---
      let roles: string[] = [];
      const maybeSingleRole = (res as any)?.role as string | undefined;
      if (maybeSingleRole) {
        const normalized = maybeSingleRole.startsWith('ROLE_')
          ? maybeSingleRole
          : `ROLE_${maybeSingleRole}`;
        roles = [normalized.toUpperCase()];
      }

      // --- 2) Parse roles array if available ---
      const maybeRoles = (res?.roles || (res?.data && (res.data as any).roles)) as
        | string[]
        | string
        | undefined;
      if ((!roles || roles.length === 0) && maybeRoles) {
        roles = Array.isArray(maybeRoles)
          ? maybeRoles.map(String)
          : [String(maybeRoles)];
      }

      // --- 3) If still empty, decode JWT payload and check for roles ---
      if (!roles || roles.length === 0) {
        const payload = parseJwt(token) as any | null;
        if (payload) {
          if (Array.isArray(payload.roles)) {
            roles = payload.roles.map((r: any) => (typeof r === 'string' ? r : r.authority ?? r.role));
          } else if (Array.isArray(payload.authorities)) {
            roles = payload.authorities.map((r: any) => (typeof r === 'string' ? r : r.authority ?? r.role));
          } else if (payload.realm_access?.roles) {
            roles = payload.realm_access.roles.map(String);
          }
          // --- ✅ Also check if JWT payload contains orgId or organizationId ---
          if (payload.organizationId || payload.orgId) {
            try { localStorage.setItem('org_id', String(payload.organizationId ?? payload.orgId)); } catch {}
          }
        }
      }

      // --- normalize roles ---
      roles = roles
        .filter(Boolean)
        .map(r => String(r).toUpperCase())
        .map(r => (r.startsWith('ROLE_') ? r : `ROLE_${r}`));

      try { localStorage.setItem(this.rolesKey, JSON.stringify(roles)); } catch {}
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
