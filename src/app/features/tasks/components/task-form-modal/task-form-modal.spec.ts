import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TaskFormModal, TaskFormDialogData } from './task-form-modal';

describe('TaskFormModal', () => {
  let component: TaskFormModal;
  let fixture: ComponentFixture<TaskFormModal>;
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const mockData: TaskFormDialogData = {
    users: [{ id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john@company.com' }]
  };

  beforeEach(async () => {
    // A plain object with a spied `close` method stands in for the real
    // MatDialogRef — we only care that the component calls `.close(...)`
    // with the right value, not that an actual dialog opens/closes.
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TaskFormModal],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        // The form includes a mat-datepicker, which needs a DateAdapter
        // to be registered — normally provided app-wide in app.config.ts,
        // but tests build their own isolated injector, so it has to be
        // provided again here.
        provideNativeDateAdapter()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in "create" mode when no task is passed in the dialog data', () => {
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBe(false);
  });

  it('does not close the dialog when the form is invalid', () => {
    component.save();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('closes with a constructed Task when the form is valid', () => {
    component.form.setValue({
      title: 'New task',
      description: 'A sufficiently long description for validation',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(2099, 0, 1),
      assigneeId: 'user-001',
      tags: 'Backend, Urgent'
    });

    component.save();

    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
    const closedWith = dialogRefMock.close.mock.calls[0][0];
    expect(closedWith.title).toBe('New task');
    expect(closedWith.tags).toEqual(['Backend', 'Urgent']);
    expect(closedWith.assignee.name).toBe('John Doe');
  });

  it('closes with no argument when cancelled', () => {
    component.cancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith();
  });
});