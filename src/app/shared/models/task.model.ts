/**
 * Possible states of a task's lifecycle.
 */
export type TaskStatus = 'todo' | 'in_progress' | 'done';

/**
 * Priority level assigned to a task, used for sorting and visual badges.
 */
export type TaskPriority = 'high' | 'medium' | 'low';

/**
 * Direction of change for a statistic value, used to color-code the UI.
 */
export type ChangeType = 'positive' | 'negative' | 'neutral';

/**
 * A person a task can be assigned to.
 */
export interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

/**
 * A single task card shown on the Kanban board.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue?: boolean;
  completedAt?: string;
  assignee: Assignee;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Shape of the response returned by GET /tasks.
 */
export interface TasksResponse {
  tasks: Task[];
  meta: {
    totalCount: number;
    lastUpdated: string;
  };
}