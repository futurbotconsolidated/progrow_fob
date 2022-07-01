import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptCardsComponent } from './concept-cards.component';

describe('ConceptCardsComponent', () => {
  let component: ConceptCardsComponent;
  let fixture: ComponentFixture<ConceptCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConceptCardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConceptCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
