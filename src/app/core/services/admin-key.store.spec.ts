import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AdminKeyStore } from './admin-key.store';

const STORAGE_KEY = 'azure-quiz-admin-key';

describe('AdminKeyStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts with no key when sessionStorage is empty', () => {
    const store = TestBed.inject(AdminKeyStore);

    expect(store.key()).toBeNull();
  });

  it('reads a previously stored key on construction', () => {
    sessionStorage.setItem(STORAGE_KEY, 'secret');

    const store = TestBed.inject(AdminKeyStore);

    expect(store.key()).toBe('secret');
  });

  it('persists a set key to sessionStorage', () => {
    const store = TestBed.inject(AdminKeyStore);

    store.set('secret');

    expect(store.key()).toBe('secret');
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('secret');
  });

  it('clears the key from state and sessionStorage', () => {
    const store = TestBed.inject(AdminKeyStore);
    store.set('secret');

    store.clear();

    expect(store.key()).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
