import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  // signals for local UI state
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  // convenience getters
  get emailTouched(): boolean {
    const c = this.form.get('email');
    return !!(c && c.touched);
  }
  get emailInvalid(): boolean {
    const c = this.form.get('email');
    return !!(c && c.invalid);
  }
  get passwordTouched(): boolean {
    const c = this.form.get('password');
    return !!(c && c.touched);
  }
  get passwordInvalid(): boolean {
    const c = this.form.get('password');
    return !!(c && c.invalid);
  }

    onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // ✔️ narrow the form value types so email/password are strings
    const { email, password } = this.form.value as { email: string; password: string };

    // AuthService.login returns Observable<{ success: boolean; roles: string[] }>
    this.auth.login(email, password).subscribe({
      next: ({ success, roles }) => {
        this.loadingSignal.set(false);
        if (!success) {
          this.errorSignal.set('Login failed: invalid credentials or token not returned.');
          return;
        }

        // role-aware redirect: adapt strings to match your backend exact role names
        const upper = roles.map((r) => String(r).toUpperCase());
        if (upper.some((r) => r.includes('BANK_ADMIN'))) {
          this.router.navigate(['/bank-admin']);
        } else if (upper.some((r) => r.includes('ROLE_ORGANIZATION'))) {
          this.router.navigate(['/org']);
        } else if (upper.some((r) => r.includes('EMPLOYEE'))) {
          this.router.navigate(['/employee']);
        } else {
          // fallback - go to login (or a default page)
          this.router.navigate(['/login']);
        }
      },
      error: (err: unknown) => {
        this.loadingSignal.set(false);
        console.error('Login error', err);
        // map known http error shapes
        const message =
          typeof err === 'object' && err !== null && 'error' in err && (err as any).error?.message
            ? (err as any).error.message
            : 'Login failed due to network/server error.';
        this.errorSignal.set(message);
      },
    });
  }
}
