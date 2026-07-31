import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';
import { CertificationList } from './features/certifications/certification-list';
import { ModuleList } from './features/modules/module-list';
import { Quiz } from './features/quiz/quiz';
import { Results } from './features/results/results';

describe('routes', () => {
  it('defines the expected paths', () => {
    expect(routes.map(route => route.path)).toEqual([
      '',
      'certifications/:certificationId',
      'certifications/:certificationId/quiz/module/:moduleId',
      'certifications/:certificationId/quiz/exam',
      'results/:sessionId',
      '**',
    ]);
  });

  it('lazy-loads the certification list at the root path', async () => {
    const route = routes.find(r => r.path === '');
    expect(await route?.loadComponent?.()).toBe(CertificationList);
  });

  it('lazy-loads the module list for a certification', async () => {
    const route = routes.find(r => r.path === 'certifications/:certificationId');
    expect(await route?.loadComponent?.()).toBe(ModuleList);
  });

  it('lazy-loads the quiz component for both module review and exam mode', async () => {
    const moduleRoute = routes.find(
      r => r.path === 'certifications/:certificationId/quiz/module/:moduleId'
    );
    const examRoute = routes.find(r => r.path === 'certifications/:certificationId/quiz/exam');

    expect(await moduleRoute?.loadComponent?.()).toBe(Quiz);
    expect(await examRoute?.loadComponent?.()).toBe(Quiz);
  });

  it('lazy-loads the results page', async () => {
    const route = routes.find(r => r.path === 'results/:sessionId');
    expect(await route?.loadComponent?.()).toBe(Results);
  });

  it('redirects unknown paths back to the root', () => {
    const route = routes.find(r => r.path === '**');
    expect(route?.redirectTo).toBe('');
  });
});
