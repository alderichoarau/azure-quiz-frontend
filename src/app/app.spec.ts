import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { App } from './app';
import { APP_VERSION } from './core/version';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideNoopAnimations(),
        provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the toolbar title link', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.toolbar-title')).toBeTruthy();
  });

  it('exposes the generated app version', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance.version).toBe(APP_VERSION);
  });

  it('switches the active language', () => {
    const fixture = TestBed.createComponent(App);
    const translate = TestBed.inject(TranslateService);
    const useSpy = vi.spyOn(translate, 'use');

    fixture.componentInstance.switchLang('en');

    expect(useSpy).toHaveBeenCalledWith('en');
  });
});
