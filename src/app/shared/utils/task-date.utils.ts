import { Task } from '../models/task.model';

/** Whole-day difference between today and the given ISO date (negative = in the past). */
export function daysBetweenTodayAnd(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Whether a task counts as overdue right now: not completed, and its
 * due date has already passed. Computed purely from `dueDate` + `status`
 * rather than trusting a stored `isOverdue` flag, so it stays correct
 * for tasks created after the mock data was generated (which won't have
 * that flag set) and self-corrects day to day without re-seeding data.
 */
export function isTaskOverdue(task: Task): boolean {
  if (task.status === 'done') {
    return false;
  }
  return daysBetweenTodayAnd(task.dueDate) < 0;
}
