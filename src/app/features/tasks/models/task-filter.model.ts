import { TaskPriority, TaskStatus } from '../../../shared/models/task.model';

/** Status filter: a specific status, or 'all' to show every column. */
export type StatusFilter = TaskStatus | 'all';

/** Priority filter: a specific priority, or 'all' to ignore priority. */
export type PriorityFilter = TaskPriority | 'all';

/** The combined filter state, held by the smart parent and passed down. */
export interface TaskFilters {
  status: StatusFilter;
  priority: PriorityFilter;
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  status: 'all',
  priority: 'all'
};
