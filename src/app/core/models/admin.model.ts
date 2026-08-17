import { ContentBlockType } from './content-block.model';
import { ModuleContentType } from './module.model';
import { QuestionType } from './quiz.model';

export interface CreateCertificationRequest {
  code: string;
  title: string;
  description?: string | null;
  position?: number | null;
}

export interface CreateModuleRequest {
  code: string;
  title: string;
  description?: string | null;
  position?: number | null;
  type: ModuleContentType;
}

export interface CreateAnswerOptionRequest {
  label: string;
  correct: boolean;
}

/**
 * `text` is used for TEXT blocks; `imageIndex` (zero-based index into the multipart request's
 * "images" parts) is used for IMAGE blocks — mirrors the backend's `CreateContentBlockRequest`.
 */
export interface CreateContentBlockRequest {
  type: ContentBlockType;
  text?: string | null;
  imageIndex?: number | null;
}

export interface CreateQuestionRequest {
  type: QuestionType;
  explanation?: string | null;
  options: CreateAnswerOptionRequest[];
  contentBlocks: CreateContentBlockRequest[];
}

export interface QuestionCreatedDto {
  questionId: string;
  certificationId: string;
}

/** One content block as returned by the admin GET endpoints — same shape the student-facing API
 * uses (id/type/text), reused here since it carries no sensitive data on its own. */
export interface AdminContentBlock {
  id: string;
  type: ContentBlockType;
  text: string | null;
}

/** Unlike the student-facing option shape, this exposes `correct` — only ever returned from
 * admin-gated endpoints. */
export interface AdminAnswerOption {
  id: string;
  label: string;
  correct: boolean;
}

/** One row of the admin's per-module question list (edit/delete). */
export interface AdminQuestionSummary {
  questionId: string;
  statement: string;
  type: QuestionType;
}

/** Full question detail used to prefill the edit form. */
export interface AdminQuestionDetail {
  questionId: string;
  moduleId: string;
  type: QuestionType;
  explanation: string | null;
  options: AdminAnswerOption[];
  contentBlocks: AdminContentBlock[];
}

/** One row of the client-side content-block builder before it is serialized for submission. */
export interface DraftContentBlock {
  /** Local-only id, used for @for tracking and removal — never sent to the backend. */
  localId: string;
  type: ContentBlockType;
  text: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
}

/** One row of the client-side answer-option builder. */
export interface DraftAnswerOption {
  localId: string;
  label: string;
  correct: boolean;
}
