import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { CertificationSummary } from '../../../core/models/certification.model';
import { QuizApiService } from '../../../core/services/quiz-api.service';

@Component({
  selector: 'app-certification-form',
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './certification-form.html',
  styleUrl: './certification-form.scss',
})
export class CertificationForm {
  private readonly quizApi = inject(QuizApiService);
  private readonly adminApi = inject(AdminApiService);

  readonly certifications = signal<CertificationSummary[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);

  readonly code = signal('');
  readonly title = signal('');
  readonly description = signal('');
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  constructor() {
    this.reloadCertifications();
  }

  submit(): void {
    if (this.code().trim().length === 0 || this.title().trim().length === 0) {
      this.submitError.set('admin.validation.requiredFields');
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    this.adminApi
      .createCertification({
        code: this.code().trim(),
        title: this.title().trim(),
        description: this.description().trim() || null,
      })
      .subscribe({
        next: created => {
          this.certifications.update(list => [...list, created]);
          this.code.set('');
          this.title.set('');
          this.description.set('');
          this.submitting.set(false);
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set('common.loadError');
        },
      });
  }

  private reloadCertifications(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.quizApi.getCertifications().subscribe({
      next: certifications => {
        this.certifications.set(certifications);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }
}
