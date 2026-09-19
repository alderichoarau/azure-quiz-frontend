import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';

import { environment } from '@environments/environment';
import { BackendAvailabilityStore } from '../services/backend-availability.store';

/**
 * A `status === 0` HttpErrorResponse means no HTTP response reached the browser at all (connection
 * refused, CORS preflight blocked, DNS failure...) -- not a normal 4xx/5xx from the API. That's
 * the signature of the backend being fully stopped (see finops-postgres-schedule.yml's nightly
 * App Service stop), so it's treated separately from an ordinary request failure.
 */
export const backendAvailabilityInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const store = inject(BackendAvailabilityStore);

  return next(req).pipe(
    tap(() => store.markAvailable()),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 0) {
        store.markUnavailable();
      } else {
        store.markAvailable();
      }
      return throwError(() => error);
    })
  );
};
