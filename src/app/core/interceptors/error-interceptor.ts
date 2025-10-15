import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    tap({
      error: (err: unknown) => {
        const e = err as HttpErrorResponse;
        
        if (e?.status === 401) {
          // auth.logout();
          router.navigate(['/login']);
        }
      }
    })
  );
};