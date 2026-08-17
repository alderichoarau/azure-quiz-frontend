import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';
import { AdminShell } from './features/admin/admin-shell/admin-shell';
import { CertificationForm } from './features/admin/certification-form/certification-form';
import { ModuleForm } from './features/admin/module-form/module-form';
import { QuestionForm } from './features/admin/question-form/question-form';
import { QuestionList } from './features/admin/question-list/question-list';
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
      'admin',
      '**',
    ]);
  });

  it('lazy-loads the admin shell and its child routes', async () => {
    const adminRoute = routes.find(r => r.path === 'admin');
    expect(await adminRoute?.loadComponent?.()).toBe(AdminShell);

    const children = adminRoute?.children ?? [];
    expect(children.map(c => c.path)).toEqual([
      '',
      'certifications',
      'certifications/:certificationId/modules',
      'certifications/:certificationId/modules/:moduleId/questions',
      'certifications/:certificationId/modules/:moduleId/questions/new',
      'certifications/:certificationId/modules/:moduleId/questions/:questionId/edit',
    ]);
    expect(children.find(c => c.path === '')?.redirectTo).toBe('certifications');
    expect(
      await children.find(c => c.path === 'certifications')?.loadComponent?.()
    ).toBe(CertificationForm);
    expect(
      await children
        .find(c => c.path === 'certifications/:certificationId/modules')
        ?.loadComponent?.()
    ).toBe(ModuleForm);
    expect(
      await children
        .find(c => c.path === 'certifications/:certificationId/modules/:moduleId/questions')
        ?.loadComponent?.()
    ).toBe(QuestionList);
    expect(
      await children
        .find(c => c.path === 'certifications/:certificationId/modules/:moduleId/questions/new')
        ?.loadComponent?.()
    ).toBe(QuestionForm);
    expect(
      await children
        .find(
          c =>
            c.path ===
            'certifications/:certificationId/modules/:moduleId/questions/:questionId/edit'
        )
        ?.loadComponent?.()
    ).toBe(QuestionForm);
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
