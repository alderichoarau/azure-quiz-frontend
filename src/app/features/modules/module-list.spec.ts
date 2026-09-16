import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ModuleSummary } from '@core/models/module.model';
import { Person } from '@core/models/person.model';
import { QuizSession } from '@core/models/quiz.model';
import { PersonSelectionStore } from '@core/services/person-selection.store';
import { QuizApiService } from '@core/services/quiz-api.service';
import { QuizSessionStore } from '@core/services/quiz-session.store';
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

function setup(apiOverrides: Partial<QuizApiService> = {}, initialPersonId: string | null = 'person-1') {
  const navigate = vi.fn();
  const start = vi.fn();
  const personStore = {
    personId: signal<string | null>(initialPersonId),
    set: vi.fn((id: string) => personStore.personId.set(id)),
    clear: vi.fn(),
  };

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
  return { fixture, component: fixture.componentInstance, navigate, start, personStore };
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

  it('opens the person selector on load when no person is selected', () => {
    const { component } = setup({}, null);

    expect(component.changingPerson()).toBe(true);
  });

  it('does not prompt for a person when one is already selected', () => {
    const { component } = setup();

    expect(component.changingPerson()).toBe(false);
  });

  it('resolves the selected person\'s display name from the roster', () => {
    const { component } = setup();

    expect(component.selectedPersonName()).toBe('Alice');
  });

  it('returns null for the display name when nothing is selected', () => {
    const { component } = setup({}, null);

    expect(component.selectedPersonName()).toBeNull();
  });

  it('selecting a person stores it and closes the selector', () => {
    const { component, personStore } = setup({}, null);

    component.onPersonChange('person-1');

    expect(personStore.set).toHaveBeenCalledWith('person-1');
    expect(component.changingPerson()).toBe(false);
  });

  it('ignores an empty selection change', () => {
    const { component, personStore } = setup({}, null);

    component.onPersonChange('');

    expect(personStore.set).not.toHaveBeenCalled();
  });

  it('blocks starting a module quiz and opens the selector when no person is chosen', () => {
    const createSession = vi.fn();
    const { component } = setup({ createSession }, null);

    component.startModuleQuiz('module-1');

    expect(createSession).not.toHaveBeenCalled();
    expect(component.changingPerson()).toBe(true);
  });

  it('blocks starting an exam and opens the selector when no person is chosen', () => {
    const createSession = vi.fn();
    const { component } = setup({ createSession }, null);

    component.startExam();

    expect(createSession).not.toHaveBeenCalled();
    expect(component.changingPerson()).toBe(true);
  });
});
