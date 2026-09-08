import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import {
  TaskFormModal,
  TaskFormDialogData
} from './features/tasks/components/task-form-modal/task-form-modal';
import { TaskService } from './core/services/TaskService';
import { UserService } from './core/services/user-service';
import { Task } from './shared/models/task.model';

@Component({
  imports: [RouterOutlet, Header, Sidebar],
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

  onSearch(query: string): void {
    this.taskService.setSearchQuery(query);
  }
}
