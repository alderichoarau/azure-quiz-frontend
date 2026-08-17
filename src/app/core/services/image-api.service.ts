import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/**
 * Fetches question images via `HttpClient` (not a plain `<img src>`) so the request goes through
 * `apiKeyInterceptor` and carries `X-Api-Key`, matching every other call to `/api/**`.
 */
@Injectable({ providedIn: 'root' })
export class ImageApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getImage(blockId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/images/${blockId}`, { responseType: 'blob' });
  }
}
