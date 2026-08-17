import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ModuleSummary } from '../../../core/models/module.model';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { QuizApiService } from '../../../core/services/quiz-api.service';
import { ModuleForm } from './module-form';

const existingModule: ModuleSummary = {
  id: 'mod-1',
  code: 'module-01',
  title: 'Module 1',
  description: 'Desc',
  position: 1,
  type: 'CONTENT',
  questionCount: 3,
};

function setup(adminApiOverrides: Record<string, unknown> = {}) {
  TestBed.configureTestingModule({
    imports: [ModuleForm],
    providers: [
      provideTranslateService({ lang: 'fr', fallbackLang: 'fr' }),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ certificationId: 'cert-1' }) } },
      },
      {
        provide: QuizApiService,
        useValue: {
          getCertifications: () => of([]),
          getModules: () => of([existingModule]),
        },
      },
      {
        provide: AdminApiService,
        useValue: {
          createModule: vi.fn(),
          updateModule: vi.fn(),
          deleteModule: vi.fn(),
          ...adminApiOverrides,
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(ModuleForm);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('ModuleForm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefills the form when starting an edit', () => {
    const { component } = setup();

    component.startEdit(existingModule);

    expect(component.editingModuleId()).toBe('mod-1');
    expect(component.code()).toBe('module-01');
    expect(component.title()).toBe('Module 1');
    expect(component.description()).toBe('Desc');
    expect(component.type()).toBe('CONTENT');
  });

  it('cancelling an edit clears the form and edit state', () => {
    const { component } = setup();
    component.startEdit(existingModule);

    component.cancelEdit();

    expect(component.editingModuleId()).toBeNull();
    expect(component.code()).toBe('');
    expect(component.title()).toBe('');
  });

  it('submits an update (not a create) while editing, and replaces the module in the list', () => {
    const updated: ModuleSummary = { ...existingModule, title: 'Renamed' };
    const updateModule = vi.fn(() => of(updated));
    const createModule = vi.fn();
    const { component } = setup({ updateModule, createModule });
    component.startEdit(existingModule);
    component.title.set('Renamed');

    component.submit();

    expect(createModule).not.toHaveBeenCalled();
    expect(updateModule).toHaveBeenCalledWith('cert-1', 'mod-1', {
      code: 'module-01',
      title: 'Renamed',
      description: 'Desc',
      type: 'CONTENT',
    });
    expect(component.modules()).toEqual([updated]);
    expect(component.editingModuleId()).toBeNull();
  });

  it('deletes a module after confirmation and removes it from the list', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteModule = vi.fn(() => of(undefined));
    const { component } = setup({ deleteModule });

    component.deleteModule(existingModule);

    expect(deleteModule).toHaveBeenCalledWith('cert-1', 'mod-1');
    expect(component.modules()).toEqual([]);
  });

  it('does not delete when the confirmation is dismissed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const deleteModule = vi.fn(() => of(undefined));
    const { component } = setup({ deleteModule });

    component.deleteModule(existingModule);

    expect(deleteModule).not.toHaveBeenCalled();
    expect(component.modules()).toEqual([existingModule]);
  });
});
