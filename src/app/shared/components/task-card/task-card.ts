import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { PriorityBadge } from '../priority-badge/priority-badge';
import { Task } from '../../models/task.model';
import { daysBetweenTodayAnd } from '../../utils/task-date.utils';

/** Fixed palette cycled through for assignee avatars, keyed by name hash. */
const AVATAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

/**
 * Result of comparing a task's due date against today, used to render
 * the meta row ("Due in 2 days" / "Overdue by 2 days" / "Completed today").
 */
interface DueInfo {
  label: string;
   icon: 'check_circle' | 'warning' | 'schedule';
  isOverdue: boolean;
}

@Component({
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    PriorityBadge
  ],
  selector: 'app-task-card',
  styleUrl: './task-card.scss',
  templateUrl: './task-card.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCard { 
  
  task = input.required<Task>();

    /** Emitted when the user picks "Edit" from the card's menu. */
  edit = output<Task>();

  /** Emitted when the user picks "Delete" from the card's menu. */
  delete = output<Task>();
  
  /** First name only, for the compact "@Sarah" footer label. */
  assigneeFirstName = computed(() => this.task().assignee.name.split(' ')[0]);

  /** Deterministic avatar color so the same person always gets the same color. */
  avatarColor = computed(() => {
    const id = this.task().assignee.id;
    const hash = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  });

  /** Human-readable due-date status, derived purely from `dueDate`/`status`/`completedAt`. */
   dueInfo = computed<DueInfo>(() => {
    const task = this.task();

    if (task.status === 'done') {
      return {
        label: `Completed ${this.formatRelativeToToday(task.completedAt)}`,
        icon: 'check_circle',
        isOverdue: false
      };
    }

    const diffDays = daysBetweenTodayAnd(task.dueDate);

    if (diffDays < 0) {
      const days = Math.abs(diffDays);
      return { label: `Overdue by ${days} day${days === 1 ? '' : 's'}`, icon: 'warning', isOverdue: true };
    }
    if (diffDays === 0) {
      return { label: 'Due today', icon: 'schedule', isOverdue: false };
    }
    return { label: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, icon: 'schedule', isOverdue: false };
  });

  /** Whole-day difference between today and the given ISO date (negative = in the past). */


  private formatRelativeToToday(isoDateTime?: string): string {
    if (!isoDateTime) {
      return '';
    }
    const diffDays = daysBetweenTodayAnd(isoDateTime);
    if (diffDays === 0) return 'today';
    if (diffDays === -1) return 'yesterday';
    return `${Math.abs(diffDays)} days ago`;
  }
}

