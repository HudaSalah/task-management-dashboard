import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TaskPriority } from '../../models/task.model';


@Component({
  imports: [],
  selector: 'app-priority-badge',
  styleUrl: './priority-badge.scss',
  templateUrl: './priority-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriorityBadge {
  priority = input.required<TaskPriority>();
}
