import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'azure-quiz-admin-key';

/**
 * Holds the admin secret (`X-Admin-Key`) in `sessionStorage` only — never in `environment.ts` or
 * the build output, unlike the public `X-Api-Key`. Cleared automatically by
 * `adminKeyInterceptor` whenever the backend rejects it (401/403), which flips the admin shell
 * back to the "enter admin key" gate.
 */
@Injectable({ providedIn: 'root' })
export class AdminKeyStore {
  private readonly _key = signal<string | null>(sessionStorage.getItem(STORAGE_KEY));
  readonly key = this._key.asReadonly();

  set(key: string): void {
    sessionStorage.setItem(STORAGE_KEY, key);
    this._key.set(key);
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this._key.set(null);
  }
}
