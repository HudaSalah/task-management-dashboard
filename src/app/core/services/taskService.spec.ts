import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from './TaskService';
import { Task, TasksResponse } from '../../shared/models/task.model';
import { StatisticsResponse } from '../../shared/models/statistic.model';

const MOCK_TASKS: Task[] = [
  {
    id: 'task-001',
    title: 'Fix login bug',
    description: 'Users cannot log in on mobile',
    status: 'todo',
    priority: 'high',
    dueDate: '2020-01-01',
    assignee: { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john@company.com' },
    tags: ['Bug Fix'],
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z'
  },
  {
    id: 'task-002',
    title: 'Write documentation',
    description: 'Document the new API endpoints',
    status: 'done',
    priority: 'medium',
    dueDate: '2020-01-02',
    completedAt: '2020-01-02T00:00:00.000Z',
    assignee: { id: 'user-002', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@company.com' },
    tags: ['Docs'],
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-02T00:00:00.000Z'
  }
];

const MOCK_TASKS_RESPONSE: TasksResponse = {
  tasks: MOCK_TASKS,
  meta: { totalCount: MOCK_TASKS.length, lastUpdated: '2020-01-02T00:00:00.000Z' }
};

const MOCK_STATISTICS_RESPONSE: StatisticsResponse = {
  statistics: [
    {
      id: 'stat-001',
      title: 'Total Tasks',
      icon: '📊',
      value: 999,
      change: '+1',
      changeLabel: 'this week',
      changeType: 'positive',
      color: '#1976D2'
    },
    {
      id: 'stat-002',
      title: 'Completed',
      icon: '✅',
      value: 999,
      change: '+1',
      changeLabel: 'today',
      changeType: 'positive',
      color: '#388E3C'
    },
    {
      id: 'stat-003',
      title: 'In Progress',
      icon: '🔄',
      value: 999,
      change: '0',
      changeLabel: 'Same as yesterday',
      changeType: 'neutral',
      color: '#FF6F00'
    },
    {
      id: 'stat-004',
      title: 'Overdue',
      icon: '⚠️',
      value: 999,
      change: '+1',
      changeLabel: 'today',
      changeType: 'negative',
      color: '#D32F2F'
    }
  ],
  lastUpdated: '2020-01-02T00:00:00.000Z'
};

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  let appRef: ApplicationRef;

  beforeEach(async () => {
    // Guarantees a clean DI container for every single test, regardless
    // of what a previous test file left behind — without this, Angular
    // can throw "test module has already been instantiated" or silently
    // reuse a stale HttpTestingController from an earlier test.
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);

    // First tick(): flushes the effect that FIRES the two httpResource
    // requests (they don't exist yet before this call).
    appRef.tick();

    httpMock.expectOne('/data/tasks.json').flush(MOCK_TASKS_RESPONSE);
    httpMock.expectOne('/data/statistics.json').flush(MOCK_STATISTICS_RESPONSE);

    // httpResource resolves the flushed response through a microtask
    // internally before its own `.value()` signal actually updates —
    // a synchronous tick() right after flush() runs too early to see
    // it. Awaiting a resolved promise yields one microtask turn, which
    // is enough for that internal update to land.
    await Promise.resolve();

    // Second tick(): NOW flushes our own effect (see TaskService's
    // constructor) that copies the resolved response into `tasksSignal`.
    appRef.tick();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial data loading', () => {
    it('exposes the fetched tasks', () => {
      expect(service.tasks().length).toBe(2);
      expect(service.tasks()[0].title).toBe('Fix login bug');
    });

    it('is not loading and has no error once both requests resolve', () => {
      expect(service.isLoading()).toBe(false);
      expect(service.error()).toBeFalsy();
    });
  });

  describe('statistics', () => {
    it('overrides the value from statistics.json with a live count from the task list', () => {
      const totalStat = service.statistics().find((s) => s.title === 'Total Tasks');
      expect(totalStat?.value).toBe(2);
    });

    it('keeps decorative fields (icon, color, change) from statistics.json untouched', () => {
      const totalStat = service.statistics().find((s) => s.title === 'Total Tasks');
      expect(totalStat?.icon).toBe('📊');
      expect(totalStat?.color).toBe('#1976D2');
      expect(totalStat?.change).toBe('+1');
    });

    it('computes "Completed" as the count of done tasks', () => {
      const completedStat = service.statistics().find((s) => s.title === 'Completed');
      expect(completedStat?.value).toBe(1);
    });

    it('computes "Overdue" using isTaskOverdue, ignoring done tasks', () => {
      const overdueStat = service.statistics().find((s) => s.title === 'Overdue');
      expect(overdueStat?.value).toBe(1);
    });
  });

  describe('addTask', () => {
    it('adds the new task to the front of the list', () => {
      const newTask: Task = { ...MOCK_TASKS[0], id: 'task-999', title: 'Brand new task' };
      service.addTask(newTask);

      expect(service.tasks().length).toBe(3);
      expect(service.tasks()[0]).toEqual(newTask);
    });
  });

  describe('updateTask', () => {
    it('replaces the task with matching id and leaves others untouched', () => {
      const updated: Task = { ...MOCK_TASKS[0], title: 'Updated title' };
      service.updateTask(updated);

      expect(service.tasks().find((t) => t.id === 'task-001')?.title).toBe('Updated title');
      expect(service.tasks().find((t) => t.id === 'task-002')?.title).toBe('Write documentation');
    });
  });

  describe('deleteTask', () => {
    it('removes the task with the matching id', () => {
      service.deleteTask('task-001');

      expect(service.tasks().length).toBe(1);
      expect(service.tasks().find((t) => t.id === 'task-001')).toBeUndefined();
    });
  });

  describe('updateTaskStatus', () => {
    it('changes the status and stamps a fresh updatedAt', () => {
      const before = service.tasks().find((t) => t.id === 'task-001')!;
      service.updateTaskStatus('task-001', 'in_progress');
      const after = service.tasks().find((t) => t.id === 'task-001')!;

      expect(after.status).toBe('in_progress');
      expect(after.updatedAt).not.toBe(before.updatedAt);
    });
  });

  describe('search query', () => {
    it('starts empty', () => {
      expect(service.searchQuery()).toBe('');
    });

    it('updates via setSearchQuery', () => {
      service.setSearchQuery('login');
      expect(service.searchQuery()).toBe('login');
    });
  });

  describe('reload', () => {
    it('re-issues both HTTP requests', () => {
      service.reload();
      appRef.tick();

      httpMock.expectOne('/data/tasks.json').flush(MOCK_TASKS_RESPONSE);
      httpMock.expectOne('/data/statistics.json').flush(MOCK_STATISTICS_RESPONSE);
    });
  });
});
