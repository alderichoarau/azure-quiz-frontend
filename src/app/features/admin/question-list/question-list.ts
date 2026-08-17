import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AdminQuestionSummary } from '../../../core/models/admin.model';
import { AdminApiService } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-question-list',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './question-list.html',
  styleUrl: './question-list.scss',
})
export class QuestionList {
  private readonly route = inject(ActivatedRoute);
  private readonly adminApi = inject(AdminApiService);
  private readonly translate = inject(TranslateService);

  readonly certificationId = this.route.snapshot.paramMap.get('certificationId')!;
  readonly moduleId = this.route.snapshot.paramMap.get('moduleId')!;

  readonly questions = signal<AdminQuestionSummary[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly deleteError = signal(false);

  constructor() {
    this.adminApi.listQuestions(this.moduleId).subscribe({
      next: questions => {
        this.questions.set(questions);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  deleteQuestion(question: AdminQuestionSummary): void {
    const preview =
      question.statement.length > 60 ? `${question.statement.slice(0, 60)}…` : question.statement;
    const confirmed = window.confirm(
      this.translate.instant('admin.questionList.deleteConfirm', { preview })
    );
    if (!confirmed) {
      return;
    }
    this.deleteError.set(false);
    this.adminApi.deleteQuestion(question.questionId).subscribe({
      next: () => this.questions.update(list => list.filter(q => q.questionId !== question.questionId)),
      error: () => this.deleteError.set(true),
    });
  }
}
