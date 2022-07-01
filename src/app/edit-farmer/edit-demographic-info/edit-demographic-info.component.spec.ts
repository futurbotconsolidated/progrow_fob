import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDemographicInfoComponent } from './edit-demographic-info.component';

describe('EditDemographicInfoComponent', () => {
  let component: EditDemographicInfoComponent;
  let fixture: ComponentFixture<EditDemographicInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDemographicInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDemographicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
