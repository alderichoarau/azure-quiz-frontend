import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminQuestionSummary } from '../../../core/models/admin.model';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { QuestionList } from './question-list';

const questions: AdminQuestionSummary[] = [
  { questionId: 'q1', statement: 'What is Azure?', type: 'SINGLE_CHOICE' },
  { questionId: 'q2', statement: 'What is a VNet?', type: 'SINGLE_CHOICE' },
];

function setup(adminApiOverrides: Record<string, unknown> = {}) {
  TestBed.configureTestingModule({
    imports: [QuestionList],
    providers: [
      provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: convertToParamMap({ certificationId: 'cert-1', moduleId: 'module-1' }),
          },
        },
      },
      {
        provide: AdminApiService,
        useValue: {
          listQuestions: () => of(questions),
          deleteQuestion: vi.fn(() => of(undefined)),
          ...adminApiOverrides,
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(QuestionList);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('QuestionList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and displays the module\'s questions', () => {
    const { component } = setup();

    expect(component.loading()).toBe(false);
    expect(component.questions()).toEqual(questions);
  });

  it('shows a load error when fetching fails', () => {
    const { component } = setup({ listQuestions: () => throwError(() => new Error('boom')) });

    expect(component.loadError()).toBe(true);
  });

  it('deletes a question after confirmation and removes it from the list', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteQuestion = vi.fn(() => of(undefined));
    const { component } = setup({ deleteQuestion });

    component.deleteQuestion(questions[0]);

    expect(deleteQuestion).toHaveBeenCalledWith('q1');
    expect(component.questions()).toEqual([questions[1]]);
  });

  it('does not delete when the confirmation is dismissed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const deleteQuestion = vi.fn(() => of(undefined));
    const { component } = setup({ deleteQuestion });

    component.deleteQuestion(questions[0]);

    expect(deleteQuestion).not.toHaveBeenCalled();
    expect(component.questions()).toEqual(questions);
  });

  it('surfaces an error and keeps the question when deletion fails', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { component } = setup({
      deleteQuestion: vi.fn(() => throwError(() => new Error('boom'))),
    });

    component.deleteQuestion(questions[0]);

    expect(component.deleteError()).toBe(true);
    expect(component.questions()).toEqual(questions);
  });
});
