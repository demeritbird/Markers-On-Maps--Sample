import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerPointComponent } from './marker-point.component';

describe('MarkerPointComponent', () => {
  let component: MarkerPointComponent;
  let fixture: ComponentFixture<MarkerPointComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MarkerPointComponent]
    });
    fixture = TestBed.createComponent(MarkerPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
