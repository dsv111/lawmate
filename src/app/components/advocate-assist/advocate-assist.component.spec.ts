import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvocateAssistComponent } from './advocate-assist.component';

describe('AdvocateAssistComponent', () => {
  let component: AdvocateAssistComponent;
  let fixture: ComponentFixture<AdvocateAssistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvocateAssistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvocateAssistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
