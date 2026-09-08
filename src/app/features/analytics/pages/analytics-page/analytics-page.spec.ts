import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AnalyticsPage } from './analytics-page';
import { TasksResponse } from '../../../../shared/models/task.model';
import { StatisticsResponse } from '../../../../shared/models/statistic.model';

// `new Chart(...)` needs something that's actually constructable with
// `new`. `vi.fn().mockImplementation(() => ({...}))` looked reasonable
// but Vitest's mock-hoisting resolved it to the plain arrow function
// itself in this project — a real ES class sidesteps that entirely,
// since a class is always valid as a constructor no matter how the
// mock module gets hoisted/transformed.
vi.mock('chart.js/auto', () => {
  class MockChart {
    data = { datasets: [{ data: [] as number[] }] };
    update = vi.fn();
    destroy = vi.fn();
  }
  return { default: MockChart };
});

const MOCK_TASKS_RESPONSE: TasksResponse = {
  tasks: [
    {
      id: 'task-001',
      title: 'Task one',
      description: 'Description',
      status: 'todo',
      priority: 'high',
      dueDate: '2099-01-01',
      assignee: { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john@company.com' },
      tags: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ],
  meta: { totalCount: 1, lastUpdated: '2024-01-01T00:00:00.000Z' }
};

const MOCK_STATISTICS_RESPONSE: StatisticsResponse = {
  statistics: [],
  lastUpdated: '2024-01-01T00:00:00.000Z'
};

describe('AnalyticsPage', () => {
  let component: AnalyticsPage;
  let fixture: ComponentFixture<AnalyticsPage>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [AnalyticsPage],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsPage);
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

  it('renders both chart section headings', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Tasks by Status');
    expect(text).toContain('Tasks by Priority');
  });
});