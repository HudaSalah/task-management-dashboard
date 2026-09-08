import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBar } from './filter-bar';
import { DEFAULT_TASK_FILTERS, TaskFilters } from '../../models/task-filter.model';

describe('FilterBar', () => {
  let component: FilterBar;
  let fixture: ComponentFixture<FilterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterBar]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterBar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('filters', DEFAULT_TASK_FILTERS);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits an updated filters object with the new status when a tab is clicked', () => {
    let emitted: TaskFilters | undefined;
    component.filtersChange.subscribe((value) => (emitted = value));

    component.setStatus('todo');

    expect(emitted).toEqual({ ...DEFAULT_TASK_FILTERS, status: 'todo' });
  });

  it('emits an updated filters object with the new priority when an option is chosen', () => {
    let emitted: TaskFilters | undefined;
    component.filtersChange.subscribe((value) => (emitted = value));

    component.setPriority('high');

    expect(emitted).toEqual({ ...DEFAULT_TASK_FILTERS, priority: 'high' });
  });

  it('emits newTask when the "+ New Task" button is clicked', () => {
    let emitted = false;
    component.newTask.subscribe(() => (emitted = true));

    component.newTask.emit();

    expect(emitted).toBe(true);
  });
});