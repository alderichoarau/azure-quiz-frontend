import { Injectable, signal } from '@angular/core';

/**
 * Tracks whether the backend is reachable at all, distinct from a normal request failure (a 404,
 * a validation 400, etc.). Flipped by backend-availability.interceptor.ts on a connection-level
 * failure (HttpErrorResponse.status === 0 -- no response reached the browser at all, which is
 * what a stopped App Service produces, see azure-infra-terraform's finops-postgres-schedule.yml),
 * and flipped back on any request that does get a response.
 */
@Injectable({ providedIn: 'root' })
export class BackendAvailabilityStore {
  readonly available = signal(true);

  markUnavailable(): void {
    this.available.set(false);
  }

  markAvailable(): void {
    this.available.set(true);
  }
}
