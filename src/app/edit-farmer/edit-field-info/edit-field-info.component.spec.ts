import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFieldInfoComponent } from './edit-field-info.component';

describe('EditFieldInfoComponent', () => {
  let component: EditFieldInfoComponent;
  let fixture: ComponentFixture<EditFieldInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFieldInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFieldInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
