import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCoApplicantComponent } from './edit-co-applicant.component';

describe('EditCoApplicantComponent', () => {
  let component: EditCoApplicantComponent;
  let fixture: ComponentFixture<EditCoApplicantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCoApplicantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCoApplicantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
