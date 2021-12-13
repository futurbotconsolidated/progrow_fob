import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdHeaderComponent } from './bd-header.component';

describe('BdHeaderComponent', () => {
  let component: BdHeaderComponent;
  let fixture: ComponentFixture<BdHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BdHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BdHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
