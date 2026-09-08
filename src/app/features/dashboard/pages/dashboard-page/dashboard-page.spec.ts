import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardPage } from './dashboard-page';
import { TasksResponse } from '../../../../shared/models/task.model';
import { StatisticsResponse } from '../../../../shared/models/statistic.model';

const MOCK_TASKS_RESPONSE: TasksResponse = {
  tasks: [],
  meta: { totalCount: 0, lastUpdated: '2024-01-01T00:00:00.000Z' }
};

const MOCK_STATISTICS_RESPONSE: StatisticsResponse = {
  statistics: [
    {
      id: 'stat-001',
      title: 'Total Tasks',
      icon: '📊',
      value: 0,
      change: '0',
      changeLabel: 'this week',
      changeType: 'neutral',
      color: '#1976D2'
    }
  ],
  lastUpdated: '2024-01-01T00:00:00.000Z'
};

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;

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

  it('renders the statistics once loaded', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Total Tasks');
  });
});
