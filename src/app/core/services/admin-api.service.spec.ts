import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { AdminQuestionDetail, AdminQuestionSummary, CreateModuleRequest } from '../models/admin.model';
import { ModuleSummary } from '../models/module.model';
import { AdminApiService } from './admin-api.service';

describe('AdminApiService', () => {
  let service: AdminApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('updates a module', () => {
    const request: CreateModuleRequest = {
      code: 'module-01',
      title: 'Updated',
      description: null,
      position: 1,
      type: 'CONTENT',
    };
    const module: ModuleSummary = {
      id: 'mod-1',
      code: 'module-01',
      title: 'Updated',
      description: null,
      position: 1,
      type: 'CONTENT',
      questionCount: 3,
    };

    service.updateModule('cert-1', 'mod-1', request).subscribe(result => expect(result).toEqual(module));

    const req = httpMock.expectOne(`${baseUrl}/certifications/cert-1/modules/mod-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(module);
  });

  it('deletes a module', () => {
    service.deleteModule('cert-1', 'mod-1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/certifications/cert-1/modules/mod-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('lists a module\'s questions', () => {
    const questions: AdminQuestionSummary[] = [
      { questionId: 'q1', statement: 'What is Azure?', type: 'SINGLE_CHOICE' },
    ];

    service.listQuestions('mod-1').subscribe(result => expect(result).toEqual(questions));

    const req = httpMock.expectOne(`${baseUrl}/modules/mod-1/questions`);
    expect(req.request.method).toBe('GET');
    req.flush(questions);
  });

  it('fetches a question detail for editing', () => {
    const detail: AdminQuestionDetail = {
      questionId: 'q1',
      moduleId: 'mod-1',
      type: 'SINGLE_CHOICE',
      explanation: null,
      options: [{ id: 'o1', label: 'A', correct: true }],
      contentBlocks: [{ id: 'b1', type: 'TEXT', text: 'Statement' }],
    };

    service.getQuestion('q1').subscribe(result => expect(result).toEqual(detail));

    const req = httpMock.expectOne(`${baseUrl}/questions/q1`);
    expect(req.request.method).toBe('GET');
    req.flush(detail);
  });

  it('submits an update as multipart/form-data with a JSON "data" part and image parts', () => {
    const image = new File(['bytes'], 'diagram.png', { type: 'image/png' });

    service
      .updateQuestion(
        'q1',
        {
          type: 'SINGLE_CHOICE',
          explanation: null,
          options: [{ label: 'A', correct: true }],
          contentBlocks: [{ type: 'IMAGE', imageIndex: 0 }],
        },
        [image]
      )
      .subscribe();

    const req = httpMock.expectOne(`${baseUrl}/questions/q1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBeInstanceOf(FormData);
    const body = req.request.body as FormData;
    const uploadedImage = body.get('images') as File;
    expect(uploadedImage).toBeInstanceOf(File);
    expect(uploadedImage.name).toBe('diagram.png');
    expect(body.get('data')).toBeInstanceOf(Blob);
    req.flush({ questionId: 'q1', certificationId: 'cert-1' });
  });

  it('deletes a question', () => {
    service.deleteQuestion('q1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/questions/q1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
