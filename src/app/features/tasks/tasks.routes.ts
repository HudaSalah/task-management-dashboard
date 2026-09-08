import { Routes } from '@angular/router';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/task-board-page/task-board-page').then((m) => m.TaskBoardPage)
  }
];
