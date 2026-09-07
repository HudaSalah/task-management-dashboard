import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { PriorityFilter, StatusFilter, TaskFilters } from '../../models/task-filter.model';

/** One entry in the status tab row. */
interface StatusTab {
  value: StatusFilter;
  label: string;
}

const STATUS_TABS: StatusTab[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

@Component({
  imports: [MatButtonModule, MatMenuModule, MatIconModule],
  selector: 'app-filter-bar',
  styleUrl: './filter-bar.scss',
  templateUrl: './filter-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBar {
    filters = input.required<TaskFilters>();

  filtersChange = output<TaskFilters>();
  newTask = output<void>();

  statusTabs = STATUS_TABS;
  priorityOptions = PRIORITY_OPTIONS;

  setStatus(status: StatusFilter): void {
    this.filtersChange.emit({ ...this.filters(), status });
  }

  setPriority(priority: PriorityFilter): void {
    this.filtersChange.emit({ ...this.filters(), priority });
  }

  /** Label for the priority dropdown button itself, e.g. "Priority: High". */
  priorityButtonLabel(): string {
    const current = this.filters().priority;
    if (current === 'all') return 'Priority';
    return this.priorityOptions.find((p) => p.value === current)?.label ?? 'Priority';
  }
}
