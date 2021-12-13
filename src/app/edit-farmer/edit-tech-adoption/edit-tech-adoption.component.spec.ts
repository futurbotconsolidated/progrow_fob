import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTechAdoptionComponent } from './edit-tech-adoption.component';

describe('EditTechAdoptionComponent', () => {
  let component: EditTechAdoptionComponent;
  let fixture: ComponentFixture<EditTechAdoptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTechAdoptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTechAdoptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
