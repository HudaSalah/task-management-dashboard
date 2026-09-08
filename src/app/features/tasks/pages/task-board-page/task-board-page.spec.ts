import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskBoardPage } from './task-board-page';
import { TasksResponse } from '../../../../shared/models/task.model';
import { StatisticsResponse } from '../../../../shared/models/statistic.model';

const MOCK_TASKS_RESPONSE: TasksResponse = {
  tasks: [],
  meta: { totalCount: 0, lastUpdated: '2024-01-01T00:00:00.000Z' }
};

const MOCK_STATISTICS_RESPONSE: StatisticsResponse = {
  statistics: [],
  lastUpdated: '2024-01-01T00:00:00.000Z'
};

describe('TaskBoardPage', () => {
  let component: TaskBoardPage;
  let fixture: ComponentFixture<TaskBoardPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [TaskBoardPage],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoardPage);
    component = fixture.componentInstance;

    fixture.detectChanges();

    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('/data/tasks.json').flush(MOCK_TASKS_RESPONSE);
    httpMock.expectOne('/data/statistics.json').flush(MOCK_STATISTICS_RESPONSE);

    // See task-service.spec.ts for why this microtask wait is needed —
    // httpResource resolves through a microtask before the component's
    // own state (isLoading, tasks, etc.) reflects the flushed response.
    await Promise.resolve();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the filter bar and kanban columns', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('To Do');
    expect(text).toContain('In Progress');
    expect(text).toContain('Done');
  });
});
