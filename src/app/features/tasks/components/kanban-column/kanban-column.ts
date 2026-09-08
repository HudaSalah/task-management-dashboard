import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TaskCard } from '../../../../shared/components/task-card/task-card';
import { Task } from '../../../../shared/models/task.model';

@Component({
  imports: [TaskCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'app-kanban-column',
  styleUrl: './kanban-column.scss',
  templateUrl: './kanban-column.html'
})
export class KanbanColumn {
  /** Column heading, e.g. "To Do". */
  title = input.required<string>();

  /** Hex color for the small dot next to the title. */
  dotColor = input.required<string>();

  /** Tasks to render in this column, already filtered by status. */
  tasks = input.required<Task[]>();

  /** Bubbled up from a card's "Edit" menu item. */
  editTask = output<Task>();

  /** Bubbled up from a card's "Delete" menu item. */
  deleteTask = output<Task>();

  /** Track function so Angular doesn't destroy/recreate cards unnecessarily. */
  trackByTaskId(_index: number, task: Task): string {
    return task.id;
  }
}
