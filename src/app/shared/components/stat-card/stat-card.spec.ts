import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCard } from './stat-card';
import { Statistic } from '../../models/statistic.model';

describe('StatCard', () => {
  let component: StatCard;
  let fixture: ComponentFixture<StatCard>;

  const mockStatistic: Statistic = {
    id: 'stat-001',
    title: 'Total Tasks',
    icon: '📊',
    value: 42,
    change: '+5',
    changeLabel: 'this week',
    changeType: 'positive',
    color: '#1976D2'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCard]
    }).compileComponents();

    fixture = TestBed.createComponent(StatCard);
    component = fixture.componentInstance;
    // Required inputs must be set BEFORE detectChanges(), or Angular
    // throws NG0950 the moment the template tries to read them.
    fixture.componentRef.setInput('statistic', mockStatistic);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the statistic title and value', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Total Tasks');
    expect(text).toContain('42');
  });
});