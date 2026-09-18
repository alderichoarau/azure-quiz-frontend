import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { TranslatePipe } from '@ngx-translate/core';

import { CreateQuizSessionRequest } from '@core/models/quiz.model';
import { PersonSelectionStore } from '@core/services/person-selection.store';
import { QuizApiService } from '@core/services/quiz-api.service';
import { QuizSessionStore } from '@core/services/quiz-session.store';
import { QuestionImage } from '@shared/components/question-image/question-image';
import { InlineMarkdownPipe } from '@shared/pipes/inline-markdown.pipe';

@Component({
  selector: 'app-quiz',
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    QuestionImage,
    InlineMarkdownPipe,
    TranslatePipe,
  ],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Quiz implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(QuizApiService);
  private readonly store = inject(QuizSessionStore);
  private readonly personStore = inject(PersonSelectionStore);

  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal(false);
  readonly selectedOptionIds = signal<string[]>([]);

  readonly session = this.store.session;
  readonly currentQuestion = this.store.currentQuestion;
  readonly lastResult = this.store.lastResult;
  readonly isLastQuestion = this.store.isLastQuestion;
  readonly progressPercent = this.store.progressPercent;
  readonly currentIndexDisplay = computed(() => this.store.currentIndex() + 1);
  readonly totalQuestions = computed(() => this.session()?.questions.length ?? 0);

  ngOnInit(): void {
    const certificationId = this.route.snapshot.paramMap.get('certificationId')!;
    const moduleId = this.route.snapshot.paramMap.get('moduleId');

    const existing = this.store.session();
    const matchesRoute =
      existing !== null &&
      existing.certificationId === certificationId &&
      existing.moduleId === moduleId;

    if (matchesRoute) {
      this.loading.set(false);
      return;
    }

    // Direct/refreshed navigation without an in-memory session (e.g. page reload) has to
    // re-create one here -- if no person was ever picked, send back to ModuleList's selector
    // rather than fail the create-session call with a missing personId.
    const personId = this.personStore.personId();
    if (!personId) {
      this.router.navigate(['/certifications', certificationId]);
      return;
    }

    const request: CreateQuizSessionRequest = moduleId
      ? { mode: 'MODULE', moduleId, personId }
      : { mode: 'EXAM', certificationId, personId };

    this.api.createSession(request).subscribe({
      next: session => {
        this.store.start(session);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  toggleOption(optionId: string, isMultiple: boolean): void {
    this.selectedOptionIds.update(ids => {
      if (isMultiple) {
        return ids.includes(optionId) ? ids.filter(id => id !== optionId) : [...ids, optionId];
      }
      return [optionId];
    });
  }

  isSelected(optionId: string): boolean {
    return this.selectedOptionIds().includes(optionId);
  }

  isCorrectOption(optionId: string): boolean {
    return this.lastResult()?.correctOptionIds.includes(optionId) ?? false;
  }

  isWrongSelection(optionId: string): boolean {
    return this.lastResult() !== null && this.isSelected(optionId) && !this.isCorrectOption(optionId);
  }

  submit(): void {
    if (this.selectedOptionIds().length === 0) {
      return;
    }
    this.submitting.set(true);
    this.submitError.set(false);
    this.store.submitAnswer(this.selectedOptionIds()).subscribe({
      next: () => this.submitting.set(false),
      error: () => {
        this.submitting.set(false);
        this.submitError.set(true);
      },
    });
  }

  next(): void {
    this.selectedOptionIds.set([]);
    if (this.isLastQuestion()) {
      const sessionId = this.session()!.sessionId;
      this.router.navigate(['/results', sessionId]);
    } else {
      this.store.goToNextQuestion();
    }
  }
}
