import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { Task, TaskPriority, TaskStatus } from '../../../../shared/models/task.model';
import { User } from '../../../../shared/models/user.model';
import { noWhitespaceValidator, notInPastValidator } from '../../validators/task-form.validators';

/** Data passed in when opening this dialog. */
export interface TaskFormDialogData {
  /** Present when editing; omitted when creating a new task. */
  task?: Task;
  /** Full list of assignable users, for the dropdown. */
  users: User[];
}

/**
 * Modal form for creating or editing a task, built with Reactive Forms.
 *
 * Used in two modes depending on `data.task`:
 * - **Create**: empty form, due date can't be in the past.
 * - **Edit**: form pre-filled from the existing task; the past-date rule
 *   is dropped so an already-overdue task can still be saved without the
 *   form fighting you over its own due date.
 *
 * On save, closes the dialog with a complete `Task` object; the caller
 * (the smart parent) decides whether that means an `addTask` or
 * `updateTask` call.
 */

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule
  ],
  selector: 'app-task-form-modal',
  styleUrl: './task-form-modal.scss',
  templateUrl: './task-form-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormModal {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TaskFormModal>);
  data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);

  isEditMode = !!this.data.task;
  users = this.data.users;

  priorities: TaskPriority[] = ['low', 'medium', 'high'];
  statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];

  form = this.fb.nonNullable.group({
    title: [this.data.task?.title ?? '', [Validators.required, noWhitespaceValidator()]],
    description: [
      this.data.task?.description ?? '',
      [Validators.required, Validators.minLength(10)]
    ],
    priority: [this.data.task?.priority ?? ('medium' as TaskPriority), Validators.required],
    status: [this.data.task?.status ?? ('todo' as TaskStatus), Validators.required],
    dueDate: [
      this.data.task?.dueDate ? new Date(this.data.task.dueDate) : null,
      // Only enforce "not in the past" when creating a brand-new task.
      this.isEditMode ? [Validators.required] : [Validators.required, notInPastValidator()]
    ],
    assigneeId: [this.data.task?.assignee.id ?? '', Validators.required],
    tags: [this.data.task?.tags.join(', ') ?? '']
  });

  get titleControl() {
    return this.form.controls.title;
  }

  get descriptionControl() {
    return this.form.controls.description;
  }

  get dueDateControl() {
    return this.form.controls.dueDate;
  }

  get assigneeIdControl() {
    return this.form.controls.assigneeId;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    // console.log('raw', raw);
    const assignee = this.users.find((u) => u.id === raw.assigneeId)!;
    const now = new Date().toISOString();

    const task: Task = {
      id: this.data.task?.id ?? `task-${Date.now()}`,
      title: raw.title.trim(),
      description: raw.description.trim(),
      status: raw.status,
      priority: raw.priority,
      dueDate: this.formatDate(raw.dueDate!),
      isOverdue: this.data.task?.isOverdue,
      completedAt: raw.status === 'done' ? (this.data.task?.completedAt ?? now) : undefined,
      assignee,
      tags: raw.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      createdAt: this.data.task?.createdAt ?? now,
      updatedAt: now
    };
    console.log('task', task);
    this.dialogRef.close(task);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
