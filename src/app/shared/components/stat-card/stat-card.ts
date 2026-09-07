import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Statistic } from '../../models/statistic.model';

@Component({
  imports: [MatCardModule],
  selector: 'app-stat-card',
  styleUrl: './stat-card.scss',
  templateUrl: './stat-card.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCard {
  statistic = input.required<Statistic>();
  changeClass = computed(() => `stat-card__change--${this.statistic().changeType}`);
}
