import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'azure-quiz-person-id';

/**
 * Remembers which roster person is taking quizzes on this browser, in `localStorage` (unlike
 * `AdminKeyStore`'s `sessionStorage`) so the student isn't asked again on their next visit.
 */
@Injectable({ providedIn: 'root' })
export class PersonSelectionStore {
  private readonly _personId = signal<string | null>(localStorage.getItem(STORAGE_KEY));
  readonly personId = this._personId.asReadonly();

  set(personId: string): void {
    localStorage.setItem(STORAGE_KEY, personId);
    this._personId.set(personId);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._personId.set(null);
  }
}
