import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { AdminKeyStore } from '../../../core/services/admin-key.store';

/**
 * Parent shell for every `/admin/**` route. Gates access behind an admin key typed once and kept
 * only in `sessionStorage` (see `AdminKeyStore`) — this is a lightweight deterrent, not a login
 * system: the real enforcement is server-side (`AdminApiKeyFilter` / `X-Admin-Key`).
 */
@Component({
  selector: 'app-admin-shell',
  imports: [RouterLink, RouterOutlet, MatButtonModule, MatIconModule, FormsModule, TranslatePipe],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShell {
  private readonly store = inject(AdminKeyStore);

  readonly key = this.store.key;
  readonly keyInput = signal('');

  enter(): void {
    if (this.keyInput().trim().length === 0) {
      return;
    }
    this.store.set(this.keyInput().trim());
    this.keyInput.set('');
  }

  signOut(): void {
    this.store.clear();
  }
}
