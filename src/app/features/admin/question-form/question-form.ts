import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin, map, Observable, of } from 'rxjs';

import { AdminApiService } from '../../../core/services/admin-api.service';
import {
  CreateAnswerOptionRequest,
  CreateContentBlockRequest,
  CreateQuestionRequest,
  DraftAnswerOption,
  DraftContentBlock,
  QuestionCreatedDto,
} from '../../../core/models/admin.model';
import { QuestionType } from '../../../core/models/quiz.model';
import { ImageApiService } from '../../../core/services/image-api.service';
import { InlineMarkdownPipe } from '../../../shared/pipes/inline-markdown.pipe';

@Component({
  selector: 'app-question-form',
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    InlineMarkdownPipe,
    TranslatePipe,
  ],
  templateUrl: './question-form.html',
  styleUrl: './question-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionForm implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly adminApi = inject(AdminApiService);
  private readonly imageApi = inject(ImageApiService);

  readonly certificationId = this.route.snapshot.paramMap.get('certificationId')!;
  readonly moduleId = this.route.snapshot.paramMap.get('moduleId')!;
  // Present only on the .../questions/:questionId/edit route — this same component and form
  // serve both create and edit, same pattern as ModuleForm.
  readonly editingQuestionId = this.route.snapshot.paramMap.get('questionId');

  readonly questionType = signal<QuestionType>('SINGLE_CHOICE');
  readonly explanation = signal('');
  readonly blocks = signal<DraftContentBlock[]>([]);
  readonly options = signal<DraftAnswerOption[]>([]);

  // Only meaningful in edit mode, while the existing question (and its images) is being fetched.
  readonly loading = signal(this.editingQuestionId !== null);
  readonly loadError = signal(false);

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitSuccess = signal<QuestionCreatedDto | null>(null);

  private nextLocalId = 0;

  constructor() {
    if (this.editingQuestionId) {
      this.loadQuestionForEdit(this.editingQuestionId);
    } else {
      this.resetForm();
    }
  }

  ngOnDestroy(): void {
    this.revokeAllPreviews();
  }

  addTextBlock(): void {
    this.blocks.update(list => [...list, this.newBlock('TEXT')]);
  }

  addImageBlock(): void {
    this.blocks.update(list => [...list, this.newBlock('IMAGE')]);
  }

  removeBlock(localId: string): void {
    const removed = this.blocks().find(b => b.localId === localId);
    if (removed?.imagePreviewUrl) {
      URL.revokeObjectURL(removed.imagePreviewUrl);
    }
    this.blocks.update(list => list.filter(b => b.localId !== localId));
  }

  onImageSelected(localId: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) {
      return;
    }
    this.blocks.update(list =>
      list.map(b => {
        if (b.localId !== localId) {
          return b;
        }
        if (b.imagePreviewUrl) {
          URL.revokeObjectURL(b.imagePreviewUrl);
        }
        return { ...b, imageFile: file, imagePreviewUrl: URL.createObjectURL(file) };
      })
    );
  }

  addOption(): void {
    this.options.update(list => [...list, { localId: this.nextId(), label: '', correct: false }]);
  }

  removeOption(localId: string): void {
    this.options.update(list => list.filter(o => o.localId !== localId));
  }

  setSingleCorrect(localId: string): void {
    this.options.update(list => list.map(o => ({ ...o, correct: o.localId === localId })));
  }

  toggleMultipleCorrect(localId: string, checked: boolean): void {
    this.options.update(list =>
      list.map(o => (o.localId === localId ? { ...o, correct: checked } : o))
    );
  }

  submit(): void {
    const error = this.validate();
    if (error) {
      this.submitError.set(error);
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);
    const { data, images } = this.buildRequest();
    const request$ = this.editingQuestionId
      ? this.adminApi.updateQuestion(this.editingQuestionId, data, images)
      : this.adminApi.createQuestion(this.moduleId, data, images);
    request$.subscribe({
      next: created => {
        this.submitting.set(false);
        this.submitSuccess.set(created);
      },
      error: () => {
        this.submitting.set(false);
        this.submitError.set('common.loadError');
      },
    });
  }

  addAnother(): void {
    this.submitSuccess.set(null);
    this.resetForm();
  }

  private newBlock(type: 'TEXT' | 'IMAGE'): DraftContentBlock {
    return { localId: this.nextId(), type, text: '', imageFile: null, imagePreviewUrl: null };
  }

  private nextId(): string {
    return `local-${this.nextLocalId++}`;
  }

  private validate(): string | null {
    const blocks = this.blocks();
    const hasNonEmptyText = blocks.some(b => b.type === 'TEXT' && b.text.trim().length > 0);
    if (!hasNonEmptyText) {
      return 'admin.validation.noTextBlock';
    }
    for (const block of blocks) {
      if (block.type === 'TEXT' && block.text.trim().length === 0) {
        return 'admin.validation.emptyTextBlock';
      }
      if (block.type === 'IMAGE' && !block.imageFile) {
        return 'admin.validation.missingImage';
      }
    }
    const options = this.options();
    if (options.length < 2 || options.some(o => o.label.trim().length === 0)) {
      return 'admin.validation.optionsIncomplete';
    }
    if (!options.some(o => o.correct)) {
      return 'admin.validation.noCorrectOption';
    }
    return null;
  }

  private buildRequest(): { data: CreateQuestionRequest; images: File[] } {
    const images: File[] = [];
    const contentBlocks: CreateContentBlockRequest[] = this.blocks().map(block => {
      if (block.type === 'TEXT') {
        return { type: 'TEXT', text: block.text.trim() };
      }
      const imageIndex = images.length;
      images.push(block.imageFile!);
      return { type: 'IMAGE', imageIndex };
    });
    const options: CreateAnswerOptionRequest[] = this.options().map(o => ({
      label: o.label.trim(),
      correct: o.correct,
    }));
    return {
      data: {
        type: this.questionType(),
        explanation: this.explanation().trim() || null,
        options,
        contentBlocks,
      },
      images,
    };
  }

  private resetForm(): void {
    this.revokeAllPreviews();
    this.questionType.set('SINGLE_CHOICE');
    this.explanation.set('');
    this.blocks.set([this.newBlock('TEXT')]);
    this.options.set([
      { localId: this.nextId(), label: '', correct: false },
      { localId: this.nextId(), label: '', correct: false },
    ]);
  }

  private revokeAllPreviews(): void {
    for (const block of this.blocks()) {
      if (block.imagePreviewUrl) {
        URL.revokeObjectURL(block.imagePreviewUrl);
      }
    }
  }

  // Prefills the form from the existing question. IMAGE blocks re-fetch their bytes as a real
  // File (not just a preview URL) — the update flow always resends every image, even unchanged
  // ones (see AdminApiService/backend AdminContentService#updateQuestion), so the draft block
  // needs a real File object ready to resubmit, exactly like a freshly-picked upload would.
  private loadQuestionForEdit(questionId: string): void {
    this.adminApi.getQuestion(questionId).subscribe({
      next: detail => {
        this.questionType.set(detail.type);
        this.explanation.set(detail.explanation ?? '');
        this.options.set(
          detail.options.map(o => ({ localId: this.nextId(), label: o.label, correct: o.correct }))
        );

        const blockRequests: Observable<DraftContentBlock>[] = detail.contentBlocks.map(block => {
          if (block.type === 'TEXT') {
            return of({
              localId: this.nextId(),
              type: 'TEXT' as const,
              text: block.text ?? '',
              imageFile: null,
              imagePreviewUrl: null,
            });
          }
          return this.imageApi.getImage(block.id).pipe(
            map(blob => ({
              localId: this.nextId(),
              type: 'IMAGE' as const,
              text: '',
              imageFile: new File([blob], `${block.id}`, { type: blob.type || 'application/octet-stream' }),
              imagePreviewUrl: URL.createObjectURL(blob),
            }))
          );
        });

        // forkJoin([]) emits [] synchronously, so the empty-content-blocks edge case (shouldn't
        // happen in practice — creation always requires at least one block) is handled for free.
        forkJoin(blockRequests).subscribe({
          next: blocks => {
            this.blocks.set(blocks);
            this.loading.set(false);
          },
          error: () => {
            this.loadError.set(true);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }
}
