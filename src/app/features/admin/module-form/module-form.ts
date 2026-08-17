import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AdminApiService } from '../../../core/services/admin-api.service';
import { ModuleContentType, ModuleSummary } from '../../../core/models/module.model';
import { QuizApiService } from '../../../core/services/quiz-api.service';

@Component({
  selector: 'app-module-form',
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './module-form.html',
  styleUrl: './module-form.scss',
})
export class ModuleForm {
  private readonly route = inject(ActivatedRoute);
  private readonly quizApi = inject(QuizApiService);
  private readonly adminApi = inject(AdminApiService);
  private readonly translate = inject(TranslateService);

  readonly certificationId = this.route.snapshot.paramMap.get('certificationId')!;

  readonly certificationCode = signal<string | null>(null);
  readonly modules = signal<ModuleSummary[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);

  readonly code = signal('');
  readonly title = signal('');
  readonly description = signal('');
  readonly type = signal<ModuleContentType>('CONTENT');
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  // Non-null while editing an existing module — the same form doubles as create/edit, same
  // pattern as QuestionForm.
  readonly editingModuleId = signal<string | null>(null);

  constructor() {
    this.quizApi.getCertifications().subscribe(certifications => {
      const match = certifications.find(c => c.id === this.certificationId);
      this.certificationCode.set(match?.code ?? null);
    });
    this.reloadModules();
  }

  startEdit(module: ModuleSummary): void {
    this.editingModuleId.set(module.id);
    this.code.set(module.code);
    this.title.set(module.title);
    this.description.set(module.description ?? '');
    this.type.set(module.type);
    this.submitError.set(null);
  }

  cancelEdit(): void {
    this.editingModuleId.set(null);
    this.resetFormFields();
  }

  submit(): void {
    if (this.code().trim().length === 0 || this.title().trim().length === 0) {
      this.submitError.set('admin.validation.requiredFields');
      return;
    }
    const editingId = this.editingModuleId();
    const request = {
      code: this.code().trim(),
      title: this.title().trim(),
      description: this.description().trim() || null,
      type: this.type(),
    };
    this.submitting.set(true);
    this.submitError.set(null);

    const request$ = editingId
      ? this.adminApi.updateModule(this.certificationId, editingId, request)
      : this.adminApi.createModule(this.certificationId, request);

    request$.subscribe({
      next: saved => {
        this.modules.update(list =>
          editingId ? list.map(m => (m.id === editingId ? saved : m)) : [...list, saved]
        );
        this.editingModuleId.set(null);
        this.resetFormFields();
        this.submitting.set(false);
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set('common.loadError');
      },
    });
  }

  deleteModule(module: ModuleSummary): void {
    const confirmed = window.confirm(
      this.translate.instant('admin.modules.deleteConfirm', { title: module.title })
    );
    if (!confirmed) {
      return;
    }
    this.adminApi.deleteModule(this.certificationId, module.id).subscribe({
      next: () => {
        this.modules.update(list => list.filter(m => m.id !== module.id));
        if (this.editingModuleId() === module.id) {
          this.cancelEdit();
        }
      },
      error: () => this.submitError.set('common.loadError'),
    });
  }

  private resetFormFields(): void {
    this.code.set('');
    this.title.set('');
    this.description.set('');
    this.type.set('CONTENT');
  }

  private reloadModules(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.quizApi.getModules(this.certificationId).subscribe({
      next: modules => {
        this.modules.set(modules);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }
}
