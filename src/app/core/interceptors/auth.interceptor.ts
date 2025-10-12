// import { Injectable, inject } from '@angular/core';

// import {

//   HttpEvent,

//   HttpHandler,

//   HttpInterceptor,

//   HttpRequest,

//   HttpErrorResponse

// } from '@angular/common/http';

// import { Observable, throwError } from 'rxjs';

// import { catchError } from 'rxjs/operators';

// import { AuthService } from '../services/auth.service';

// import { Router } from '@angular/router';



// @Injectable()

// export class AuthInterceptor implements HttpInterceptor {

//   // use inject() instead of constructor injection

//   private auth = inject(AuthService);

//   private router = inject(Router);



//   intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

//     const token = localStorage.getItem('auth_token_v1');
//     console.log("intercepted");

//     let cloned = req;



//     // Attach Authorization header only when token present and header not already set

//     if (token) {

//       cloned = req.clone({

//         setHeaders: {

//           Authorization: `Bearer ${token}`

//         }

//       });

//     }



//     return next.handle(cloned).pipe(

//       catchError((err: unknown) => {

//         if (err instanceof HttpErrorResponse) {

//           // handle 401/403 globally: logout + redirect to login (optional)

//           if (err.status === 401 || err.status === 403) {

//             // clear local state and navigate to login

//             this.auth.logout();

//             this.router.navigate(['/login']);

//           }

//         }

//         return throwError(() => err);

//       })

//     );

//   }

// }

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  console.log("Interceptor called");
    
  if (!token) return next(req); 
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};