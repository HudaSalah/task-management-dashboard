import { Injectable, computed, effect, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Task, TasksResponse, TaskStatus } from '../../shared/models/task.model';
import { Statistic, StatisticsResponse } from '../../shared/models/statistic.model';
import { isTaskOverdue } from '../../shared/utils/task-date.utils';

/**
 * Central data-access point for tasks and dashboard statistics.
 *
 * Built on the new `httpResource()` API instead of a manual
 * `HttpClient.get()` + `Subscription`: `httpResource` tracks its own
 * loading/error/value state as signals and re-fetches automatically if
 * its request function's dependencies change, which removes the need to
 * manage RxJS subscriptions (and the memory-leak risk that comes with
 * forgetting to unsubscribe) by hand.
 *
 * `providedIn: 'root'` makes this a singleton — every component that
 * injects `TaskService` shares the same resource, so the data is fetched
 * once and reused everywhere instead of re-requested per component.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {

  /** Raw resource for the tasks endpoint.*/
  private tasksResource = httpResource<TasksResponse>(() => '/data/tasks.json');
  
/** Raw resource for the statistics endpoint.*/
  private statisticsResource = httpResource<StatisticsResponse>(() => '/data/statistics.json');

  /** All tasks, or an empty array while loading / on error. */
  // tasks = computed<Task[]>(() => this.tasksResource.value()?.tasks ?? []);

//   private logTasksResourceValue = effect(() => {
//   console.log('tasksResourceValue', this.tasks());
// });
  /** All dashboard statistics, or an empty array while loading / on error. */
  // statistics = computed<Statistic[]>(() => this.statisticsResource.value()?.statistics ?? []);

  /** True while either request is in flight. */
  isLoading = computed(() => this.tasksResource.isLoading() || this.statisticsResource.isLoading());

  /** The first error encountered, if any, across both requests. */
  error = computed(() => this.tasksResource.error() ?? this.statisticsResource.error());


    /** Local, mutable copy of the fetched tasks. Source of truth once loaded. */
  private tasksSignal = signal<Task[]>([]);
 
  constructor() {
    effect(() => {
      const response = this.tasksResource.value();
      if (response) {
        this.tasksSignal.set(response.tasks);
      }
    });
  }
 
  /** All tasks. Read-only from the outside — use the CRUD methods below to mutate. */
  tasks = this.tasksSignal.asReadonly();

  /** Re-runs both requests — used by the "Retry" action on the error state. */
  reload(): void {
    this.tasksResource.reload();
    this.statisticsResource.reload();
  }

  /** Adds a newly created task to the top of the list. */
  addTask(task: Task): void {
    this.tasksSignal.update((tasks) => [task, ...tasks]);
  }
 
  /** Replaces an existing task by id with its updated version. */
  updateTask(updated: Task): void {
    this.tasksSignal.update((tasks) => tasks.map((t) => (t.id === updated.id ? updated : t)));
  }
 
  /** Removes a task by id. */
  deleteTask(id: string): void {
    this.tasksSignal.update((tasks) => tasks.filter((t) => t.id !== id));
  }
 
  /** Moves a task to a new status — used by drag-and-drop between columns. */
  updateTaskStatus(id: string, status: TaskStatus): void {
    this.tasksSignal.update((tasks) =>
      tasks.map((task) =>
        task.id === id
          ? { ...task, status, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }

  
  /**
   * Dashboard statistics, with `value` recomputed live from the actual
   * task list — so it updates the moment a task is added, edited,
   * deleted, or its status changes, instead of staying frozen at
   * whatever `statistics.json` said at load time.
   *
   * The decorative parts of each card (icon, color, and the "+12 this
   * week" delta caption) still come from `statistics.json`, since there's
   * no historical snapshot to compute a real delta against — only the
   * headline number is live. Matched by title rather than `id` so it
   * stays correct even if the mock JSON's ids ever change.
   */
  statistics = computed<Statistic[]>(() => {
    const baseline = this.statisticsResource.value()?.statistics ?? [];
    const tasks = this.tasksSignal();
 
    const liveValueByTitle: Record<string, number> = {
      'total tasks': tasks.length,
      completed: tasks.filter((t) => t.status === 'done').length,
      'in progress': tasks.filter((t) => t.status === 'in_progress').length,
      overdue: tasks.filter((t) => isTaskOverdue(t)).length
    };
 
    return baseline.map((stat) => {
      const liveValue = liveValueByTitle[stat.title.toLowerCase()];
      return liveValue === undefined ? stat : { ...stat, value: liveValue };
    });
  });
}