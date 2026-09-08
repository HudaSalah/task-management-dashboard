import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskBoard } from './task-board';
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

describe('TaskBoard', () => {
  let component: TaskBoard;
  let fixture: ComponentFixture<TaskBoard>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [TaskBoard],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoard);
    component = fixture.componentInstance;

    // detectChanges() runs change detection, which is what actually
    // flushes the effect() inside TaskService that fires the httpResource
    // requests — the requests don't exist yet until this call happens,
    // so httpMock.expectOne() has to come AFTER it, not before.
    fixture.detectChanges();

    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('/data/tasks.json').flush(MOCK_TASKS_RESPONSE);
    httpMock.expectOne('/data/statistics.json').flush(MOCK_STATISTICS_RESPONSE);

    await Promise.resolve();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is not loading once both requests resolve', () => {
    expect(component.isLoading()).toBe(false);
  });
});
