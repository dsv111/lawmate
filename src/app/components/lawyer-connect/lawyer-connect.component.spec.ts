import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawyerConnectComponent } from './lawyer-connect.component';

describe('LawyerConnectComponent', () => {
  let component: LawyerConnectComponent;
  let fixture: ComponentFixture<LawyerConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LawyerConnectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LawyerConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
