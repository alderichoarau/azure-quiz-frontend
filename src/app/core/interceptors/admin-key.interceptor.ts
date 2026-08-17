import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminKeyStore } from '../services/admin-key.store';

/**
 * Attaches `X-Admin-Key` to `/api/admin/**` requests only — this key is never shipped in the
 * frontend bundle (unlike `X-Api-Key`/apiKeyInterceptor), it lives solely in `sessionStorage` via
 * `AdminKeyStore`. A 401/403 response clears the stored key, which flips the admin shell back to
 * the "enter admin key" gate.
 */
export const adminKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(`${environment.apiBaseUrl}/admin`)) {
    return next(req);
  }

  const store = inject(AdminKeyStore);
  const key = store.key();
  const authedReq = key ? req.clone({ setHeaders: { 'X-Admin-Key': key } }) : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        store.clear();
      }
      return throwError(() => error);
    })
  );
};
