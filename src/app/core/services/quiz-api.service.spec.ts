import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { CertificationSummary } from '../models/certification.model';
import { ModuleSummary } from '../models/module.model';
import {
  AnswerResult,
  CreateQuizSessionRequest,
  QuizResult,
  QuizSession,
  SubmitAnswerRequest,
} from '../models/quiz.model';
import { QuizApiService } from './quiz-api.service';

describe('QuizApiService', () => {
  let service: QuizApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuizApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches the certification list', () => {
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

    service.getCertifications().subscribe(result => expect(result).toEqual(certifications));

    const req = httpMock.expectOne(`${baseUrl}/certifications`);
    expect(req.request.method).toBe('GET');
    req.flush(certifications);
  });

  it('fetches the modules of a certification', () => {
    const modules: ModuleSummary[] = [
      {
        id: 'mod-1',
        code: 'M1',
        title: 'Module 1',
        description: null,
        position: 1,
        type: 'CONTENT',
        questionCount: 10,
      },
    ];

    service.getModules('cert-1').subscribe(result => expect(result).toEqual(modules));

    const req = httpMock.expectOne(`${baseUrl}/certifications/cert-1/modules`);
    expect(req.request.method).toBe('GET');
    req.flush(modules);
  });

  it('creates a quiz session', () => {
    const request: CreateQuizSessionRequest = {
      mode: 'MODULE',
      moduleId: 'mod-1',
      questionCount: 10,
    };
    const session: QuizSession = {
      sessionId: 'session-1',
      mode: 'MODULE',
      certificationId: 'cert-1',
      moduleId: 'mod-1',
      questions: [],
    };

    service.createSession(request).subscribe(result => expect(result).toEqual(session));

    const req = httpMock.expectOne(`${baseUrl}/quiz-sessions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(session);
  });

  it('submits an answer for a question', () => {
    const request: SubmitAnswerRequest = { selectedOptionIds: ['opt-1'] };
    const result: AnswerResult = { correct: true, correctOptionIds: ['opt-1'], explanation: null };

    service.submitAnswer('session-1', 'q1', request).subscribe(r => expect(r).toEqual(result));

    const req = httpMock.expectOne(`${baseUrl}/quiz-sessions/session-1/questions/q1/answer`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(result);
  });

  it('fetches the final result of a session', () => {
    const result: QuizResult = {
      sessionId: 'session-1',
      totalQuestions: 2,
      answeredCount: 2,
      correctCount: 1,
      scorePercentage: 50,
      details: [],
    };

    service.getResult('session-1').subscribe(r => expect(r).toEqual(result));

    const req = httpMock.expectOne(`${baseUrl}/quiz-sessions/session-1/result`);
    expect(req.request.method).toBe('GET');
    req.flush(result);
  });
});
