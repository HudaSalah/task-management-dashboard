import { Assignee } from './task.model';

/**
 * A user who can be assigned to tasks. Structurally identical to
 * `Assignee` — kept as a separate named type so "the list of all users"
 * and "the person a task is assigned to" read clearly as different
 * concepts in code, even though they share a shape.
 */
export type User = Assignee;
