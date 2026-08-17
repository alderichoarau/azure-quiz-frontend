import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { AdminQuestionDetail } from '../../../core/models/admin.model';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ImageApiService } from '../../../core/services/image-api.service';
import { QuestionForm } from './question-form';

function setup(
  adminApiOverrides: Record<string, unknown> = {},
  routeParams: Record<string, string> = { certificationId: 'cert-1', moduleId: 'module-1' },
  imageApiOverrides: Record<string, unknown> = {}
) {
  const createQuestion = vi.fn(() => of({ questionId: 'q1', certificationId: 'cert-1' }));
  TestBed.configureTestingModule({
    imports: [QuestionForm],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap(routeParams) } },
      },
      { provide: AdminApiService, useValue: { createQuestion, ...adminApiOverrides } },
      { provide: ImageApiService, useValue: { getImage: vi.fn(), ...imageApiOverrides } },
    ],
  });

  const fixture = TestBed.createComponent(QuestionForm);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, createQuestion };
}

describe('QuestionForm', () => {
  it('starts with one text block and two empty options', () => {
    const { component } = setup();

    expect(component.blocks()).toHaveLength(1);
    expect(component.blocks()[0].type).toBe('TEXT');
    expect(component.options()).toHaveLength(2);
    expect(component.options().every(o => !o.correct)).toBe(true);
  });

  it('adds and removes content blocks', () => {
    const { component } = setup();

    component.addImageBlock();
    expect(component.blocks()).toHaveLength(2);
    expect(component.blocks()[1].type).toBe('IMAGE');

    const idToRemove = component.blocks()[1].localId;
    component.removeBlock(idToRemove);
    expect(component.blocks()).toHaveLength(1);
  });

  it('rejects submit when there is no non-empty text block', () => {
    const { component, createQuestion } = setup();

    component.submit();

    expect(component.submitError()).toBe('admin.validation.noTextBlock');
    expect(createQuestion).not.toHaveBeenCalled();
  });

  it('rejects submit when no option is marked correct', () => {
    const { component, createQuestion } = setup();
    component.blocks()[0].text = 'What is Azure?';
    component.options()[0].label = 'A';
    component.options()[1].label = 'B';

    component.submit();

    expect(component.submitError()).toBe('admin.validation.noCorrectOption');
    expect(createQuestion).not.toHaveBeenCalled();
  });

  it('builds and submits the request for a valid text-only question', () => {
    const { component, createQuestion } = setup();
    component.blocks()[0].text = 'What is Azure?';
    component.options()[0].label = 'A cloud platform';
    component.options()[1].label = 'A database';
    component.setSingleCorrect(component.options()[0].localId);
    component.explanation.set('Because.');

    component.submit();

    expect(createQuestion).toHaveBeenCalledWith(
      'module-1',
      {
        type: 'SINGLE_CHOICE',
        explanation: 'Because.',
        options: [
          { label: 'A cloud platform', correct: true },
          { label: 'A database', correct: false },
        ],
        contentBlocks: [{ type: 'TEXT', text: 'What is Azure?' }],
      },
      []
    );
    expect(component.submitSuccess()).toEqual({ questionId: 'q1', certificationId: 'cert-1' });
  });

  it('surfaces a generic error and keeps the form when the request fails', () => {
    const { component } = setup({ createQuestion: vi.fn(() => throwError(() => new Error('boom'))) });
    component.blocks()[0].text = 'What is Azure?';
    component.options()[0].label = 'A';
    component.options()[1].label = 'B';
    component.setSingleCorrect(component.options()[0].localId);

    component.submit();

    expect(component.submitError()).toBe('common.loadError');
    expect(component.submitSuccess()).toBeNull();
  });

  it('resets the form when adding another question', () => {
    const { component } = setup();
    component.blocks()[0].text = 'What is Azure?';
    component.options()[0].label = 'A';
    component.options()[1].label = 'B';
    component.setSingleCorrect(component.options()[0].localId);
    component.submit();

    component.addAnother();

    expect(component.submitSuccess()).toBeNull();
    expect(component.blocks()).toHaveLength(1);
    expect(component.blocks()[0].text).toBe('');
    expect(component.options()).toHaveLength(2);
    expect(component.options().every(o => o.label === '' && !o.correct)).toBe(true);
  });

  describe('edit mode', () => {
    const detail: AdminQuestionDetail = {
      questionId: 'q1',
      moduleId: 'module-1',
      type: 'MULTIPLE_CHOICE',
      explanation: 'Because.',
      options: [
        { id: 'o1', label: 'A cloud platform', correct: true },
        { id: 'o2', label: 'A database', correct: false },
      ],
      contentBlocks: [
        { id: 'b1', type: 'TEXT', text: 'Look at this:' },
        { id: 'b2', type: 'IMAGE', text: null },
      ],
    };
    const routeParams = {
      certificationId: 'cert-1',
      moduleId: 'module-1',
      questionId: 'q1',
    };

    it('prefills the form from the existing question, refetching images as Files', () => {
      const imageBlob = new Blob(['bytes'], { type: 'image/png' });
      const { component } = setup(
        { getQuestion: vi.fn(() => of(detail)) },
        routeParams,
        { getImage: vi.fn(() => of(imageBlob)) }
      );

      expect(component.loading()).toBe(false);
      expect(component.questionType()).toBe('MULTIPLE_CHOICE');
      expect(component.explanation()).toBe('Because.');
      expect(component.options().map(o => ({ label: o.label, correct: o.correct }))).toEqual([
        { label: 'A cloud platform', correct: true },
        { label: 'A database', correct: false },
      ]);
      expect(component.blocks()).toHaveLength(2);
      expect(component.blocks()[0]).toMatchObject({ type: 'TEXT', text: 'Look at this:' });
      expect(component.blocks()[1].type).toBe('IMAGE');
      expect(component.blocks()[1].imageFile).toBeInstanceOf(File);
      expect(component.blocks()[1].imagePreviewUrl).toBeTruthy();
    });

    it('surfaces a load error when fetching the question fails', () => {
      const { component } = setup(
        { getQuestion: vi.fn(() => throwError(() => new Error('boom'))) },
        routeParams
      );

      expect(component.loadError()).toBe(true);
      expect(component.loading()).toBe(false);
    });

    it('submits via updateQuestion (not createQuestion) when editing', () => {
      const updateQuestion = vi.fn(() => of({ questionId: 'q1', certificationId: 'cert-1' }));
      const createQuestion = vi.fn();
      const { component } = setup(
        { getQuestion: vi.fn(() => of(detail)), updateQuestion, createQuestion },
        routeParams,
        { getImage: vi.fn(() => of(new Blob(['x'], { type: 'image/png' }))) }
      );

      component.submit();

      expect(createQuestion).not.toHaveBeenCalled();
      expect(updateQuestion).toHaveBeenCalledWith('q1', expect.anything(), expect.anything());
      expect(component.submitSuccess()).toEqual({ questionId: 'q1', certificationId: 'cert-1' });
    });
  });
});
