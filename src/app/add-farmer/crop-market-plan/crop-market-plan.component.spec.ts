import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropMarketPlanComponent } from './crop-market-plan.component';

describe('CropMarketPlanComponent', () => {
  let component: CropMarketPlanComponent;
  let fixture: ComponentFixture<CropMarketPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CropMarketPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CropMarketPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
