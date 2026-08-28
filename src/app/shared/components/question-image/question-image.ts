import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnChanges,
  inject,
  input,
  signal,
} from '@angular/core';

import { ImageApiService } from '../../../core/services/image-api.service';

/**
 * Renders one IMAGE content block. Fetches the bytes through `ImageApiService` (so the
 * `X-Api-Key` header is attached) and turns them into an object URL, revoked on destroy/change
 * to avoid leaking memory across a long quiz session.
 */
@Component({
  selector: 'app-question-image',
  imports: [],
  template: `
    @if (objectUrl(); as url) {
      <img [src]="url" class="question-image" alt="" />
    } @else if (loadError()) {
      <p class="image-error">Image unavailable</p>
    }
  `,
  styles: [
    `
      .question-image {
        display: block;
        max-width: 100%;
        border-radius: 8px;
        margin: 4px 0 16px;
      }

      .image-error {
        color: #b3261e;
        font-size: 0.85rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionImage implements OnChanges {
  readonly blockId = input.required<string>();

  private readonly api = inject(ImageApiService);

  readonly objectUrl = signal<string | null>(null);
  readonly loadError = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revoke());
  }

  ngOnChanges(): void {
    this.revoke();
    this.loadError.set(false);
    this.api.getImage(this.blockId()).subscribe({
      next: blob => this.objectUrl.set(URL.createObjectURL(blob)),
      error: () => this.loadError.set(true),
    });
  }

  private revoke(): void {
    const current = this.objectUrl();
    if (current) {
      URL.revokeObjectURL(current);
    }
    this.objectUrl.set(null);
  }
}
