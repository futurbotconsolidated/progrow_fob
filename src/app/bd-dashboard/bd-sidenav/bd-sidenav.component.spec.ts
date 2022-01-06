import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BdSidenavComponent } from './bd-sidenav.component';

describe('BdSidenavComponent', () => {
  let component: BdSidenavComponent;
  let fixture: ComponentFixture<BdSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BdSidenavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BdSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
