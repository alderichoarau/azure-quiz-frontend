import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/certifications/certification-list').then(m => m.CertificationList),
  },
  {
    path: 'certifications/:certificationId',
    loadComponent: () => import('./features/modules/module-list').then(m => m.ModuleList),
  },
  {
    path: 'certifications/:certificationId/quiz/module/:moduleId',
    loadComponent: () => import('./features/quiz/quiz').then(m => m.Quiz),
  },
  {
    path: 'certifications/:certificationId/quiz/exam',
    loadComponent: () => import('./features/quiz/quiz').then(m => m.Quiz),
  },
  {
    path: 'results/:sessionId',
    loadComponent: () => import('./features/results/results').then(m => m.Results),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-shell/admin-shell').then(m => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'certifications' },
      {
        path: 'certifications',
        loadComponent: () =>
          import('./features/admin/certification-form/certification-form').then(
            m => m.CertificationForm
          ),
      },
      {
        path: 'certifications/:certificationId/modules',
        loadComponent: () =>
          import('./features/admin/module-form/module-form').then(m => m.ModuleForm),
      },
      {
        path: 'certifications/:certificationId/modules/:moduleId/questions',
        loadComponent: () =>
          import('./features/admin/question-list/question-list').then(m => m.QuestionList),
      },
      {
        path: 'certifications/:certificationId/modules/:moduleId/questions/new',
        loadComponent: () =>
          import('./features/admin/question-form/question-form').then(m => m.QuestionForm),
      },
      {
        path: 'certifications/:certificationId/modules/:moduleId/questions/:questionId/edit',
        loadComponent: () =>
          import('./features/admin/question-form/question-form').then(m => m.QuestionForm),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
