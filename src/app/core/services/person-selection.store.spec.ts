import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { PersonSelectionStore } from './person-selection.store';

const STORAGE_KEY = 'azure-quiz-person-id';

describe('PersonSelectionStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts with no person selected when localStorage is empty', () => {
    const store = TestBed.inject(PersonSelectionStore);

    expect(store.personId()).toBeNull();
  });

  it('reads a previously stored person id on construction', () => {
    localStorage.setItem(STORAGE_KEY, 'person-1');

    const store = TestBed.inject(PersonSelectionStore);

    expect(store.personId()).toBe('person-1');
  });

  it('persists a selected person id to localStorage', () => {
    const store = TestBed.inject(PersonSelectionStore);

    store.set('person-2');

    expect(store.personId()).toBe('person-2');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('person-2');
  });

  it('clears the selection from state and localStorage', () => {
    const store = TestBed.inject(PersonSelectionStore);
    store.set('person-3');

    store.clear();

    expect(store.personId()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
