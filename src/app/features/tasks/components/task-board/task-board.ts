import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { KanbanColumn } from '../kanban-column/kanban-column';
import { FilterBar } from '../filter-bar/filter-bar';
import { TaskFormModal, TaskFormDialogData } from '../task-form-modal/task-form-modal';
import {
  ConfirmDialog,
  ConfirmDialogData
} from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { TaskService } from '../../../../core/services/TaskService';
import { UserService } from '../../../../core/services/user-service';
import { Task } from '../../../../shared/models/task.model';
import { DEFAULT_TASK_FILTERS, TaskFilters } from '../../models/task-filter.model';

/**
 * Self-contained task board: filter bar + the three-column Kanban view,
 * including its own loading/error state and all create/edit/delete
 * dialog orchestration.
 *
 * This is the ONE place this logic lives. Both the Dashboard page and
 * the Tasks page render `<app-task-board />` rather than each having
 * their own copy — so a change here (a new filter, a new dialog option)
 * only has to be made once and both pages pick it up automatically.
 */
@Component({
  imports: [KanbanColumn, FilterBar, MatProgressSpinnerModule, MatButtonModule],
  selector: 'app-task-board',
  styleUrl: './task-board.scss',
  templateUrl: './task-board.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskBoard {
  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  isLoading = this.taskService.isLoading;
  error = this.taskService.error;

  filters = signal<TaskFilters>(DEFAULT_TASK_FILTERS);

  private filteredTasks = computed(() => {
    const { priority } = this.filters();
    const query = this.taskService.searchQuery().trim().toLowerCase();

    return this.taskService
      .tasks()
      .filter((t) => priority === 'all' || t.priority === priority)
      .filter(
        (t) =>
          !query ||
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
  });

  showTodoColumn = computed(() => ['all', 'todo'].includes(this.filters().status));
  showInProgressColumn = computed(() => ['all', 'in_progress'].includes(this.filters().status));
  showDoneColumn = computed(() => ['all', 'done'].includes(this.filters().status));

  todoTasks = computed(() => this.filteredTasks().filter((t) => t.status === 'todo'));
  inProgressTasks = computed(() => this.filteredTasks().filter((t) => t.status === 'in_progress'));
  doneTasks = computed(() => this.filteredTasks().filter((t) => t.status === 'done'));

  onFiltersChange(filters: TaskFilters): void {
    this.filters.set(filters);
  }

  retry(): void {
    this.taskService.reload();
  }

  openCreateTaskDialog(): void {
    const dialogRef = this.dialog.open<TaskFormModal, TaskFormDialogData, Task>(TaskFormModal, {
      data: { users: this.userService.users() }
    });

    dialogRef.afterClosed().subscribe((task) => {
      if (task) {
        this.taskService.addTask(task);
      }
    });
  }

  openEditTaskDialog(task: Task): void {
    const dialogRef = this.dialog.open<TaskFormModal, TaskFormDialogData, Task>(TaskFormModal, {
      data: { task, users: this.userService.users() }
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.taskService.updateTask(updated);
      }
    });
  }

  confirmDeleteTask(task: Task): void {
    const dialogRef = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete task?',
        message: `"${task.title}" will be permanently removed. This can't be undone.`,
        confirmLabel: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.taskService.deleteTask(task.id);
      }
    });
  }
}
