import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha'; // Import the reCAPTCHA module

import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxCaptchaModule // Add the reCAPTCHA module to your imports
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export default class Login {
  // ## Injected Services
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  // ## reCAPTCHA Configuration
  // Get your site key from the Google reCAPTCHA admin console (v2 Checkbox)
  protected readonly siteKey = `${environment.captchaSiteKey}`;

  // ## Form Definition
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    recaptcha: ['', [Validators.required]] // Add the reCAPTCHA form control
  });

  // ## UI State Signals
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  // ## Event Handlers
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // ✅ Deconstruct email and password from the form's value
    const { email, password } = this.form.value as { email: string; password: string; };

    // ✅ Call the login method with two separate arguments as before
    this.auth.login(email, password).subscribe({
      next: ({ success, roles }) => {
        this.loadingSignal.set(false);
        if (!success) {
          this.errorSignal.set('Login failed: Invalid credentials or token not returned.');
          // You might want to reset reCAPTCHA here
          return;
        }

        // Role-based redirect logic...
        const upperRoles = roles.map((r) => String(r).toUpperCase());
        if (upperRoles.includes('ROLE_BANK_ADMIN')) {
          this.router.navigate(['/bank-admin']);
        } else if (upperRoles.includes('ROLE_ORGANIZATION')) {
          this.router.navigate(['/org']);
        } else if (upperRoles.includes('ROLE_EMPLOYEE')) { // Example: It might be ROLE_EMPLOYEE
          this.router.navigate(['/employee']);
        } else {
          // This block is now less likely to be hit
          console.error('Redirect failed: No matching role found for user.');
          this.router.navigate(['/login']);
        }
      },
      error: (err: any) => {
        this.loadingSignal.set(false);
        const message = err.error?.message || 'Login failed due to a network or server error.';
        this.errorSignal.set(message);
        // You might want to reset reCAPTCHA here
      },
    });
  }
}