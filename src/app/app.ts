import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { StatCard } from './shared/components/stat-card/stat-card';
import { KanbanColumn } from './features/tasks/components/kanban-column/kanban-column';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { TaskService } from './core/services/TaskService';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  TaskFormModal,
  TaskFormDialogData
} from './features/tasks/components/task-form-modal/task-form-modal';
import {
  ConfirmDialog,
  ConfirmDialogData
} from './shared/components/confirm-dialog/confirm-dialog';
import { UserService } from './core/services/user-service';
import { Task } from './shared/models/task.model';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
@Component({
  imports: [ Header,
    Sidebar,
    StatCard,
    KanbanColumn,
    MatProgressSpinnerModule,
    MatButtonModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {

  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
 
  statistics = this.taskService.statistics;
  isLoading = this.taskService.isLoading;
  error = this.taskService.error;
 
  todoTasks = computed(() => this.taskService.tasks().filter((t) => t.status === 'todo'));
  inProgressTasks = computed(() => this.taskService.tasks().filter((t) => t.status === 'in_progress'));
  doneTasks = computed(() => this.taskService.tasks().filter((t) => t.status === 'done'));
 
  retry(): void {
    this.taskService.reload();
  }
 
  /** Opens the form modal in "create" mode. Called by the Sidebar's "+ New Task" button. */
  openCreateTaskDialog(): void {
    const dialogRef = this.dialog.open<TaskFormModal, TaskFormDialogData, Task>(
      TaskFormModal,
      { data: { users: this.userService.users() } }
    );
 
    dialogRef.afterClosed().subscribe((task) => {
      if (task) {
        this.taskService.addTask(task);
      }
    });
  }
 
  /** Opens the form modal pre-filled with the given task. Called from a card's "Edit" action. */
  openEditTaskDialog(task: Task): void {
    const dialogRef = this.dialog.open<TaskFormModal, TaskFormDialogData, Task>(
      TaskFormModal,
      { data: { task, users: this.userService.users() } }
    );
 
    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.taskService.updateTask(updated);
      }
    });
  }
 
  /** Opens a confirmation dialog before deleting. Called from a card's "Delete" action. */
  confirmDeleteTask(task: Task): void {
    const dialogRef = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(
      ConfirmDialog,
      {
        data: {
          title: 'Delete task?',
          message: `"${task.title}" will be permanently removed. This can't be undone.`,
          confirmLabel: 'Delete'
        }
      }
    );
 
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.taskService.deleteTask(task.id);
      }
    });
  }
}
