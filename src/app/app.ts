import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { APP_VERSION } from './core/version';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  // Regenerated from package.json at install time -- see
  // scripts/generate-version.mjs.
  readonly version = APP_VERSION;

  // The admin section needs more horizontal room (two-column question editor + preview) than
  // the student quiz view's deliberately narrow, readable column — see .content-wide in app.scss.
  readonly isAdminRoute = signal(this.router.url.startsWith('/admin'));

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin')));
  }

  switchLang(lang: 'fr' | 'en'): void {
    this.translate.use(lang);
  }
}
