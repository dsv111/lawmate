import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalbotComponent } from './legalbot.component';

describe('LegalbotComponent', () => {
  let component: LegalbotComponent;
  let fixture: ComponentFixture<LegalbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalbotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
