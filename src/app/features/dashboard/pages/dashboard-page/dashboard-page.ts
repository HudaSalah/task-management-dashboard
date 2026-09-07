import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { TaskService } from '../../../../core/services/TaskService';
 
@Component({
  imports: [MatProgressSpinnerModule, MatButtonModule, StatCard],
  selector: 'app-dashboard-page',
  styleUrl: './dashboard-page.scss',
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage {
  private taskService = inject(TaskService);
 
  statistics = this.taskService.statistics;
  isLoading = this.taskService.isLoading;
  error = this.taskService.error;
 
  retry(): void {
    this.taskService.reload();
  }
}
