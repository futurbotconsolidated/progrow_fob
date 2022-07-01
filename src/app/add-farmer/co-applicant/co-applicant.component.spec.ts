import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoApplicantComponent } from './co-applicant.component';

describe('CoApplicantComponent', () => {
  let component: CoApplicantComponent;
  let fixture: ComponentFixture<CoApplicantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoApplicantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoApplicantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
