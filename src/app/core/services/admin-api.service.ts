import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AdminQuestionDetail,
  AdminQuestionSummary,
  CreateCertificationRequest,
  CreateModuleRequest,
  CreateQuestionRequest,
  QuestionCreatedDto,
} from '../models/admin.model';
import { CertificationSummary } from '../models/certification.model';
import { ModuleSummary } from '../models/module.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin`;

  createCertification(request: CreateCertificationRequest): Observable<CertificationSummary> {
    return this.http.post<CertificationSummary>(`${this.baseUrl}/certifications`, request);
  }

  createModule(certificationId: string, request: CreateModuleRequest): Observable<ModuleSummary> {
    return this.http.post<ModuleSummary>(
      `${this.baseUrl}/certifications/${certificationId}/modules`,
      request
    );
  }

  updateModule(
    certificationId: string,
    moduleId: string,
    request: CreateModuleRequest
  ): Observable<ModuleSummary> {
    return this.http.put<ModuleSummary>(
      `${this.baseUrl}/certifications/${certificationId}/modules/${moduleId}`,
      request
    );
  }

  deleteModule(certificationId: string, moduleId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/certifications/${certificationId}/modules/${moduleId}`
    );
  }

  listQuestions(moduleId: string): Observable<AdminQuestionSummary[]> {
    return this.http.get<AdminQuestionSummary[]>(`${this.baseUrl}/modules/${moduleId}/questions`);
  }

  createQuestion(
    moduleId: string,
    data: CreateQuestionRequest,
    images: File[]
  ): Observable<QuestionCreatedDto> {
    return this.http.post<QuestionCreatedDto>(
      `${this.baseUrl}/modules/${moduleId}/questions`,
      toQuestionFormData(data, images)
    );
  }

  getQuestion(questionId: string): Observable<AdminQuestionDetail> {
    return this.http.get<AdminQuestionDetail>(`${this.baseUrl}/questions/${questionId}`);
  }

  updateQuestion(
    questionId: string,
    data: CreateQuestionRequest,
    images: File[]
  ): Observable<QuestionCreatedDto> {
    return this.http.put<QuestionCreatedDto>(
      `${this.baseUrl}/questions/${questionId}`,
      toQuestionFormData(data, images)
    );
  }

  deleteQuestion(questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/questions/${questionId}`);
  }
}

function toQuestionFormData(data: CreateQuestionRequest, images: File[]): FormData {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  for (const image of images) {
    formData.append('images', image, image.name);
  }
  return formData;
}
