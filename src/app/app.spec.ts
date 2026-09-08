import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { TasksResponse } from './shared/models/task.model';
import { StatisticsResponse } from './shared/models/statistic.model';

const MOCK_TASKS_RESPONSE: TasksResponse = {
  tasks: [],
  meta: { totalCount: 0, lastUpdated: '2024-01-01T00:00:00.000Z' }
};

const MOCK_STATISTICS_RESPONSE: StatisticsResponse = {
  statistics: [],
  lastUpdated: '2024-01-01T00:00:00.000Z'
};

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // App renders <app-sidebar> (routerLink) and <router-outlet>, and
      // injects TaskService/UserService/MatDialog directly — needs both
      // a router and HTTP testing set up, same reasoning as every other
      // TaskService-dependent spec in this project.
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('/data/tasks.json').flush(MOCK_TASKS_RESPONSE);
    httpMock.expectOne('/data/statistics.json').flush(MOCK_STATISTICS_RESPONSE);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the header and sidebar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('app-sidebar')).toBeTruthy();
  });
});
