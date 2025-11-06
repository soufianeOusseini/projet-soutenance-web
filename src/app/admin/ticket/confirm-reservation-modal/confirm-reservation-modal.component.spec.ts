import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmReservationModalComponent } from './confirm-reservation-modal.component';

describe('ConfirmReservationModalComponent', () => {
  let component: ConfirmReservationModalComponent;
  let fixture: ComponentFixture<ConfirmReservationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmReservationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmReservationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
