import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Person } from '../../../core/models/person.model';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { QuizApiService } from '../../../core/services/quiz-api.service';
import { ParticipantList } from './participant-list';

const people: Person[] = [
  { id: 'person-1', name: 'Alice' },
  { id: 'person-2', name: 'Bob' },
];

function setup(
  quizApiOverrides: Record<string, unknown> = {},
  adminApiOverrides: Record<string, unknown> = {}
) {
  TestBed.configureTestingModule({
    imports: [ParticipantList],
    providers: [
      provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
      { provide: QuizApiService, useValue: { getPeople: () => of(people), ...quizApiOverrides } },
      {
        provide: AdminApiService,
        useValue: {
          createPerson: vi.fn(),
          deletePerson: vi.fn(() => of(undefined)),
          ...adminApiOverrides,
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(ParticipantList);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('ParticipantList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the roster on init', () => {
    const { component } = setup();

    expect(component.loading()).toBe(false);
    expect(component.people()).toEqual(people);
  });

  it('shows a load error when fetching fails', () => {
    const { component } = setup({ getPeople: () => throwError(() => new Error('boom')) });

    expect(component.loadError()).toBe(true);
  });

  it('refuses to submit a blank name', () => {
    const createPerson = vi.fn();
    const { component } = setup({}, { createPerson });

    component.submit();

    expect(createPerson).not.toHaveBeenCalled();
    expect(component.submitError()).toBe('admin.validation.requiredFields');
  });

  it('creates a person, inserts it sorted by name, and resets the form', () => {
    const created: Person = { id: 'person-3', name: 'Aaron' };
    const createPerson = vi.fn(() => of(created));
    const { component } = setup({}, { createPerson });
    component.name.set('Aaron');

    component.submit();

    expect(createPerson).toHaveBeenCalledWith({ name: 'Aaron' });
    expect(component.people()).toEqual([created, ...people]);
    expect(component.name()).toBe('');
  });

  it('surfaces an error when creation fails', () => {
    const { component } = setup({}, { createPerson: vi.fn(() => throwError(() => new Error('boom'))) });
    component.name.set('Aaron');

    component.submit();

    expect(component.submitError()).toBe('common.loadError');
  });

  it('deletes a person after confirmation and removes it from the list', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deletePerson = vi.fn(() => of(undefined));
    const { component } = setup({}, { deletePerson });

    component.deletePerson(people[0]);

    expect(deletePerson).toHaveBeenCalledWith('person-1');
    expect(component.people()).toEqual([people[1]]);
  });

  it('does not delete when the confirmation is dismissed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const deletePerson = vi.fn(() => of(undefined));
    const { component } = setup({}, { deletePerson });

    component.deletePerson(people[0]);

    expect(deletePerson).not.toHaveBeenCalled();
    expect(component.people()).toEqual(people);
  });

  it('surfaces an error and keeps the person when deletion fails', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { component } = setup(
      {},
      { deletePerson: vi.fn(() => throwError(() => new Error('boom'))) }
    );

    component.deletePerson(people[0]);

    expect(component.deleteError()).toBe(true);
    expect(component.people()).toEqual(people);
  });
});
