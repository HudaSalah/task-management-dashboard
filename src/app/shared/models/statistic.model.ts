import { ChangeType } from './task.model';

/**
 * A single statistic card shown at the top of the dashboard
 * (e.g. "Total Tasks", "Completed", "In Progress", "Overdue").
 */
export interface Statistic {
  id: string;
  title: string;
  icon: string;
  value: number;
  change: string;
  changeLabel: string;
  changeType: ChangeType;
  color: string;
}

/**
 * Shape of the response returned by GET /statistics.
 */
export interface StatisticsResponse {
  statistics: Statistic[];
  lastUpdated: string;
}
