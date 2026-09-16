import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

import { PersonStats } from '../../../core/models/admin.model';
import { AdminApiService } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-admin-stats',
  imports: [DecimalPipe, MatProgressBarModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stats {
  private readonly adminApi = inject(AdminApiService);

  readonly stats = signal<PersonStats[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);

  constructor() {
    this.adminApi.getPeopleStats().subscribe({
      next: stats => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }
}
