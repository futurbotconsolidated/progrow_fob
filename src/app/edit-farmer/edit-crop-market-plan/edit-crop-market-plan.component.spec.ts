import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCropMarketPlanComponent } from './edit-crop-market-plan.component';

describe('EditCropMarketPlanComponent', () => {
  let component: EditCropMarketPlanComponent;
  let fixture: ComponentFixture<EditCropMarketPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCropMarketPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCropMarketPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
