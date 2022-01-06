import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFarmerComponent } from './edit-farmer.component';

describe('EditFarmerComponent', () => {
  let component: EditFarmerComponent;
  let fixture: ComponentFixture<EditFarmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFarmerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFarmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
