import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanColumn } from './kanban-column';

describe('KanbanColumn', () => {
  let component: KanbanColumn;
  let fixture: ComponentFixture<KanbanColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanColumn]
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanColumn);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'To Do');
    fixture.componentRef.setInput('dotColor', '#3b82f6');
    fixture.componentRef.setInput('tasks', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the column title and a zero count when there are no tasks', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('To Do');
    expect(text).toContain('0');
  });

  it('shows the empty-state message when there are no tasks', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No tasks here');
  });
});