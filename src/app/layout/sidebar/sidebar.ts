import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
 
 
interface NavItem {
  icon: string;
  label: string;
  color: string;
  route?: string;
}

@Component({
  imports: [MatIconModule, MatButtonModule, RouterLink, RouterLinkActive, MatTooltipModule],
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
 /** Emitted when the "+ New Task" button is clicked. */
  newTask = output<void>();
 
  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', color: '#2563eb', route: '/dashboard' },
    { icon: 'check_circle', label: 'Tasks', color: '#16a34a', route: '/tasks' },
    { icon: 'calendar_today', label: 'Calendar', color: '#b45309' },
    { icon: 'bar_chart', label: 'Analytics', color: '#9333ea' },
    { icon: 'group', label: 'Team', color: '#1e3a8a' },
    { icon: 'settings', label: 'Settings', color: '#6b7280' }
  ];
}
