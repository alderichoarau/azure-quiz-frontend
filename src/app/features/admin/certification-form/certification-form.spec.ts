import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CertificationSummary } from '../../../core/models/certification.model';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { QuizApiService } from '../../../core/services/quiz-api.service';
import { CertificationForm } from './certification-form';

const certifications: CertificationSummary[] = [
  {
    id: 'cert-1',
    code: 'AZ-900',
    title: 'Microsoft Azure Fundamentals',
    description: null,
    position: 1,
    moduleCount: 3,
  },
];

function setup(
  quizApiOverrides: Record<string, unknown> = {},
  adminApiOverrides: Record<string, unknown> = {}
) {
  TestBed.configureTestingModule({
    imports: [CertificationForm],
    providers: [
      provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
      {
        provide: QuizApiService,
        useValue: { getCertifications: () => of(certifications), ...quizApiOverrides },
      },
      {
        provide: AdminApiService,
        useValue: { createCertification: vi.fn(), ...adminApiOverrides },
      },
    ],
  });

  const fixture = TestBed.createComponent(CertificationForm);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('CertificationForm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads existing certifications on init', () => {
    const { component } = setup();

    expect(component.loading()).toBe(false);
    expect(component.certifications()).toEqual(certifications);
  });

  it('shows a load error when fetching fails', () => {
    const { component } = setup({ getCertifications: () => throwError(() => new Error('boom')) });

    expect(component.loadError()).toBe(true);
  });

  it('refuses to submit without a code or title', () => {
    const createCertification = vi.fn();
    const { component } = setup({}, { createCertification });

    component.submit();

    expect(createCertification).not.toHaveBeenCalled();
    expect(component.submitError()).toBe('admin.validation.requiredFields');
  });

  it('creates a certification, appends it to the list, and resets the form', () => {
    const created: CertificationSummary = {
      id: 'cert-2',
      code: 'AZ-104',
      title: 'Azure Administrator',
      description: null,
      position: 2,
      moduleCount: 0,
    };
    const createCertification = vi.fn(() => of(created));
    const { component } = setup({}, { createCertification });
    component.code.set('AZ-104');
    component.title.set('Azure Administrator');

    component.submit();

    expect(createCertification).toHaveBeenCalledWith({
      code: 'AZ-104',
      title: 'Azure Administrator',
      description: null,
    });
    expect(component.certifications()).toEqual([...certifications, created]);
    expect(component.code()).toBe('');
    expect(component.title()).toBe('');
  });

  it('surfaces an error when creation fails', () => {
    const { component } = setup(
      {},
      { createCertification: vi.fn(() => throwError(() => new Error('boom'))) }
    );
    component.code.set('AZ-104');
    component.title.set('Azure Administrator');

    component.submit();

    expect(component.submitError()).toBe('common.loadError');
  });
});
