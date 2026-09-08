import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TaskBoard } from '../../components/task-board/task-board';
@Component({
  imports: [TaskBoard],
  selector: 'app-task-board-page',
  styleUrl: './task-board-page.scss',
  templateUrl: './task-board-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskBoardPage {}
