import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { describe, expect, it, vi } from 'vitest';

import { AdminKeyStore } from '../../../core/services/admin-key.store';
import { AdminShell } from './admin-shell';

function setup(storeOverrides: Record<string, unknown> = {}) {
  const set = vi.fn();
  const clear = vi.fn();

  TestBed.configureTestingModule({
    imports: [AdminShell],
    providers: [
      provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
      {
        provide: AdminKeyStore,
        useValue: { key: signal<string | null>(null), set, clear, ...storeOverrides },
      },
    ],
  });

  const fixture = TestBed.createComponent(AdminShell);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, set, clear };
}

describe('AdminShell', () => {
  it('shows the key gate when no key is stored', () => {
    const { component } = setup();

    expect(component.key()).toBeNull();
  });

  it('does nothing when submitting a blank key', () => {
    const { component, set } = setup();

    component.enter();

    expect(set).not.toHaveBeenCalled();
  });

  it('trims and stores the entered key, then clears the input', () => {
    const { component, set } = setup();
    component.keyInput.set('  secret  ');

    component.enter();

    expect(set).toHaveBeenCalledWith('secret');
    expect(component.keyInput()).toBe('');
  });

  it('signs out by clearing the store', () => {
    const { component, clear } = setup({ key: signal('secret') });

    component.signOut();

    expect(clear).toHaveBeenCalled();
  });
});
