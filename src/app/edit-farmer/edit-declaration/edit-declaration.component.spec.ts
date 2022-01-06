import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDeclarationComponent } from './edit-declaration.component';

describe('EditDeclarationComponent', () => {
  let component: EditDeclarationComponent;
  let fixture: ComponentFixture<EditDeclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDeclarationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
