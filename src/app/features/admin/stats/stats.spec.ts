import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { PersonStats } from '../../../core/models/admin.model';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { Stats } from './stats';

const stats: PersonStats[] = [
  {
    personId: 'person-1',
    personName: 'Alice',
    totalAnswers: 10,
    correctAnswers: 7,
    globalSuccessRate: 70,
    byModule: [
      {
        moduleId: 'mod-1',
        moduleTitle: 'Cloud concepts',
        totalAnswers: 10,
        correctAnswers: 7,
        successRate: 70,
      },
    ],
  },
];

function setup(adminApiOverrides: Record<string, unknown> = {}) {
  TestBed.configureTestingModule({
    imports: [Stats],
    providers: [
      provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
      {
        provide: AdminApiService,
        useValue: { getPeopleStats: () => of(stats), ...adminApiOverrides },
      },
    ],
  });

  const fixture = TestBed.createComponent(Stats);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('Stats', () => {
  it('loads per-person stats on init', () => {
    const { component } = setup();

    expect(component.loading()).toBe(false);
    expect(component.stats()).toEqual(stats);
  });

  it('shows a load error when fetching fails', () => {
    const { component } = setup({ getPeopleStats: () => throwError(() => new Error('boom')) });

    expect(component.loadError()).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('renders an empty state when no participants exist', () => {
    const { fixture, component } = setup({ getPeopleStats: () => of([]) });

    expect(component.stats()).toEqual([]);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.innerHTML;
    expect(html).not.toContain('Alice');
  });
});
