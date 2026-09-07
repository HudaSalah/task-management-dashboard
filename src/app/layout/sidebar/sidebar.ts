import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
 
interface NavItem {
  icon: string;
  label: string;
  color: string;
  active?: boolean;
}

@Component({
  imports: [MatIconModule, MatButtonModule],
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  newTask = output<void>();
  
  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', color: '#2563eb', active: true },
    { icon: 'check_circle', label: 'Tasks', color: '#16a34a' },
    { icon: 'calendar_today', label: 'Calendar', color: '#b45309' },
    { icon: 'bar_chart', label: 'Analytics', color: '#9333ea' },
    { icon: 'group', label: 'Team', color: '#1e3a8a' },
    { icon: 'settings', label: 'Settings', color: '#6b7280' }
  ];
}
