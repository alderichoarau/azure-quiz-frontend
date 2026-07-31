import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../environments/environment';
import { apiKeyInterceptor } from './api-key.interceptor';

// environment is a plain mutable object (no `as const`/Object.freeze), so
// tests flip apiKey/apiBaseUrl directly rather than mocking the module --
// mirrors how the interceptor itself reads it at request time.
describe('apiKeyInterceptor', () => {
  const originalApiKey = environment.apiKey;
  const originalBaseUrl = environment.apiBaseUrl;

  beforeEach(() => {
    environment.apiBaseUrl = 'http://localhost:8080/api';
  });

  afterEach(() => {
    environment.apiKey = originalApiKey;
    environment.apiBaseUrl = originalBaseUrl;
  });

  it('passes the request through unchanged when no api key is configured', () => {
    environment.apiKey = '';
    const req = new HttpRequest('GET', `${environment.apiBaseUrl}/certifications`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature must match HttpHandlerFn
    const next = vi.fn((req: HttpRequest<unknown>) => of(new HttpResponse({ status: 200 })));

    apiKeyInterceptor(req, next).subscribe();

    expect(next).toHaveBeenCalledWith(req);
  });

  it('adds the X-Api-Key header when a key is configured and the request targets the backend', () => {
    environment.apiKey = 'secret-key';
    const req = new HttpRequest('GET', `${environment.apiBaseUrl}/certifications`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature must match HttpHandlerFn
    const next = vi.fn((req: HttpRequest<unknown>) => of(new HttpResponse({ status: 200 })));

    apiKeyInterceptor(req, next).subscribe();

    const forwarded = next.mock.calls[0][0] as HttpRequest<unknown>;
    expect(forwarded.headers.get('X-Api-Key')).toBe('secret-key');
    expect(forwarded).not.toBe(req);
  });

  it('leaves requests to other origins untouched even when a key is configured', () => {
    environment.apiKey = 'secret-key';
    const req = new HttpRequest('GET', 'https://other-domain.example/data');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature must match HttpHandlerFn
    const next = vi.fn((req: HttpRequest<unknown>) => of(new HttpResponse({ status: 200 })));

    apiKeyInterceptor(req, next).subscribe();

    expect(next).toHaveBeenCalledWith(req);
  });
});
