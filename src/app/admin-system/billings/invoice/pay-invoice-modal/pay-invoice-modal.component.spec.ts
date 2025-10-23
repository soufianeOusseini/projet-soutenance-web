import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayInvoiceModalComponent } from './pay-invoice-modal.component';

describe('PayInvoiceModalComponent', () => {
  let component: PayInvoiceModalComponent;
  let fixture: ComponentFixture<PayInvoiceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayInvoiceModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayInvoiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
