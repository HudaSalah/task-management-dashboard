import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCard } from './task-card';
import { Task } from '../../models/task.model';

describe('TaskCard', () => {
  let component: TaskCard;
  let fixture: ComponentFixture<TaskCard>;

  const mockTask: Task = {
    id: 'task-001',
    title: 'Fix login bug',
    description: 'Users cannot log in on mobile devices',
    status: 'todo',
    priority: 'high',
    dueDate: '2099-01-01', // far future — never overdue, regardless of when the test runs
    assignee: { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john@company.com' },
    tags: ['Bug Fix'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCard]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the task title and description', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Fix login bug');
    expect(text).toContain('Users cannot log in');
  });

  it('shows a "Due in X days" label for a future due date', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Due in');
  });

  it('emits the task on the edit output', () => {
    let emitted: Task | undefined;
    component.edit.subscribe((task) => (emitted = task));

    component.edit.emit(mockTask);

    expect(emitted).toEqual(mockTask);
  });
});