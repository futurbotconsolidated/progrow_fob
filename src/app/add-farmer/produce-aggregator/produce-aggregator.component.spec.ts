import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduceAggregatorComponent } from './produce-aggregator.component';

describe('ProduceAggregatorComponent', () => {
  let component: ProduceAggregatorComponent;
  let fixture: ComponentFixture<ProduceAggregatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProduceAggregatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProduceAggregatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
