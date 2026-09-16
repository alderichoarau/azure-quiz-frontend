import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Person } from '@core/models/person.model';
import { AdminApiService } from '@core/services/admin-api.service';
import { QuizApiService } from '@core/services/quiz-api.service';

@Component({
  selector: 'app-participant-list',
  imports: [FormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './participant-list.html',
  styleUrl: './participant-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantList {
  // Listing goes through the public /api/people endpoint (same one the student selector uses) --
  // only create/delete need the admin key.
  private readonly quizApi = inject(QuizApiService);
  private readonly adminApi = inject(AdminApiService);
  private readonly translate = inject(TranslateService);

  readonly people = signal<Person[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly deleteError = signal(false);

  readonly name = signal('');
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  constructor() {
    this.reload();
  }

  submit(): void {
    if (this.name().trim().length === 0) {
      this.submitError.set('admin.validation.requiredFields');
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    this.adminApi.createPerson({ name: this.name().trim() }).subscribe({
      next: created => {
        this.people.update(list =>
          [...list, created].sort((a, b) => a.name.localeCompare(b.name))
        );
        this.name.set('');
        this.submitting.set(false);
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set('common.loadError');
      },
    });
  }

  deletePerson(person: Person): void {
    const confirmed = window.confirm(
      this.translate.instant('admin.people.deleteConfirm', { name: person.name })
    );
    if (!confirmed) {
      return;
    }
    this.deleteError.set(false);
    this.adminApi.deletePerson(person.id).subscribe({
      next: () => this.people.update(list => list.filter(p => p.id !== person.id)),
      error: () => this.deleteError.set(true),
    });
  }

  private reload(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.quizApi.getPeople().subscribe({
      next: people => {
        this.people.set(people);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }
}
