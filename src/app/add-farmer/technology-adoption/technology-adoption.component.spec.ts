import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologyAdoptionComponent } from './technology-adoption.component';

describe('TechnologyAdoptionComponent', () => {
  let component: TechnologyAdoptionComponent;
  let fixture: ComponentFixture<TechnologyAdoptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TechnologyAdoptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TechnologyAdoptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
