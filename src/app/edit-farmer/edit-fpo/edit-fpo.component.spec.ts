import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFpoComponent } from './edit-fpo.component';

describe('EditFpoComponent', () => {
  let component: EditFpoComponent;
  let fixture: ComponentFixture<EditFpoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFpoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFpoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
