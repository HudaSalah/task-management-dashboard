import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  viewChild
} from '@angular/core';
import Chart from 'chart.js/auto';
import { TaskService } from '../../../../core/services/TaskService';
 

/**
 * Analytics page: two Chart.js charts showing how tasks break down by
 * status and by priority, recomputed live as tasks are added/edited/
 * deleted/moved (same `TaskService.tasks()` signal the rest of the app
 * reads from).
 *
 * Uses `effect()` + `viewChild()` instead of `ngAfterViewInit` + manual
 * subscriptions: the effect re-runs automatically whenever the computed
 * counts change AND whenever the canvas element first becomes available,
 * so there's no separate "did the view load yet" bookkeeping to get wrong.
 */

@Component({
  imports: [],
  selector: 'app-analytics-page',
  styleUrl: './analytics-page.scss',
  templateUrl: './analytics-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsPage {
  private taskService = inject(TaskService);
  private destroyRef = inject(DestroyRef);
 
  private statusCanvas = viewChild<ElementRef<HTMLCanvasElement>>('statusCanvas');
  private priorityCanvas = viewChild<ElementRef<HTMLCanvasElement>>('priorityCanvas');
 
  private statusChart?: Chart;
  private priorityChart?: Chart;
 
  private statusCounts = computed(() => {
    const tasks = this.taskService.tasks();
    return {
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length
    };
  });
 
  private priorityCounts = computed(() => {
    const tasks = this.taskService.tasks();
    return {
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length
    };
  });
 
  constructor() {
    effect(() => {
      const statusEl = this.statusCanvas()?.nativeElement;
      const counts = this.statusCounts();
      if (!statusEl) {
        return; // view not ready yet — effect reruns once it is
      }
 
      if (this.statusChart) {
        this.statusChart.data.datasets[0].data = [counts.todo, counts.inProgress, counts.done];
        this.statusChart.update();
      } else {
        this.statusChart = new Chart(statusEl, {
          type: 'doughnut',
          data: {
            labels: ['To Do', 'In Progress', 'Done'],
            datasets: [
              {
                data: [counts.todo, counts.inProgress, counts.done],
                backgroundColor: ['#3b82f6', '#f59e0b', '#16a34a']
              }
            ]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
      }
    });
 
    effect(() => {
      const priorityEl = this.priorityCanvas()?.nativeElement;
      const counts = this.priorityCounts();
      if (!priorityEl) {
        return;
      }
 
      if (this.priorityChart) {
        this.priorityChart.data.datasets[0].data = [counts.high, counts.medium, counts.low];
        this.priorityChart.update();
      } else {
        this.priorityChart = new Chart(priorityEl, {
          type: 'bar',
          data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [
              {
                data: [counts.high, counts.medium, counts.low],
                backgroundColor: ['#dc2626', '#d97706', '#16a34a']
              }
            ]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
          }
        });
      }
    });
 
    // Chart.js instances hold canvas/WebGL resources that outlive the
    // component unless explicitly destroyed — this is the manual cleanup
    // equivalent of unsubscribing from an RxJS subscription.
    this.destroyRef.onDestroy(() => {
      this.statusChart?.destroy();
      this.priorityChart?.destroy();
    });
  }
}
