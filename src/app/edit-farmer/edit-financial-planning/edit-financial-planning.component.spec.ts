import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFinancialPlanningComponent } from './edit-financial-planning.component';

describe('EditFinancialPlanningComponent', () => {
  let component: EditFinancialPlanningComponent;
  let fixture: ComponentFixture<EditFinancialPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFinancialPlanningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFinancialPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
