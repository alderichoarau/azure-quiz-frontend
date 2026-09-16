import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ModuleSummary } from '../../core/models/module.model';
import { Person } from '../../core/models/person.model';
import { QuizSession } from '../../core/models/quiz.model';
import { PersonSelectionStore } from '../../core/services/person-selection.store';
import { QuizApiService } from '../../core/services/quiz-api.service';
import { QuizSessionStore } from '../../core/services/quiz-session.store';
import { ModuleList } from './module-list';

const modules: ModuleSummary[] = [
  {
    id: 'module-1',
    code: 'cloud-concepts',
    title: 'Cloud concepts',
    description: null,
    position: 1,
    type: 'CONTENT',
    questionCount: 2,
  },
];

const session: QuizSession = {
  sessionId: 'session-1',
  mode: 'MODULE',
  certificationId: 'cert-1',
  moduleId: 'module-1',
  questions: [],
};

const people: Person[] = [{ id: 'person-1', name: 'Alice' }];

function setup(apiOverrides: Partial<QuizApiService> = {}) {
  const navigate = vi.fn();
  const start = vi.fn();
  const personStore = { personId: signal<string | null>('person-1'), set: vi.fn(), clear: vi.fn() };

  TestBed.configureTestingModule({
    imports: [ModuleList],
    providers: [
      provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ certificationId: 'cert-1' }) } },
      },
      { provide: Router, useValue: { navigate } },
      { provide: QuizSessionStore, useValue: { start } },
      { provide: PersonSelectionStore, useValue: personStore },
      {
        provide: QuizApiService,
        useValue: {
          getModules: () => of(modules),
          getPeople: () => of(people),
          createSession: () => of(session),
          ...apiOverrides,
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(ModuleList);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, navigate, start };
}

describe('ModuleList', () => {
  it('loads modules for the certification from the route', () => {
    const { component } = setup();

    expect(component.certificationId).toBe('cert-1');
    expect(component.loading()).toBe(false);
    expect(component.modules()).toEqual(modules);
  });

  it('starts a module quiz session and navigates to it', () => {
    const { component, navigate, start } = setup();

    component.startModuleQuiz('module-1');

    expect(start).toHaveBeenCalledWith(session);
    expect(navigate).toHaveBeenCalledWith([
      '/certifications',
      'cert-1',
      'quiz',
      'module',
      'module-1',
    ]);
  });

  it('starts an exam session and navigates to it', () => {
    const { component, navigate } = setup();

    component.startExam();

    expect(navigate).toHaveBeenCalledWith(['/certifications', 'cert-1', 'quiz', 'exam']);
  });
});
