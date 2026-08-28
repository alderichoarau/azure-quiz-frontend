import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { adminKeyInterceptor } from './core/interceptors/admin-key.interceptor';
import { apiKeyInterceptor } from './core/interceptors/api-key.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([apiKeyInterceptor, adminKeyInterceptor])),
    provideAnimationsAsync(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
      lang: 'fr',
      fallbackLang: 'fr',
    }),
  ],
};
