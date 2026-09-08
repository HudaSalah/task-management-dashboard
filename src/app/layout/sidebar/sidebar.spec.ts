import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders all six navigation labels', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    for (const item of component.navItems) {
      expect(text).toContain(item.label);
    }
  });

  it('emits newTask when the "+ New Task" button is clicked', () => {
    let emitted = false;
    component.newTask.subscribe(() => (emitted = true));

    component.newTask.emit();

    expect(emitted).toBe(true);
  });
});
