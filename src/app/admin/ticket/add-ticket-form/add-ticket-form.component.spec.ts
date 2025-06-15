import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTicketFormComponent } from './add-ticket-form.component';

describe('AddTicketFormComponent', () => {
  let component: AddTicketFormComponent;
  let fixture: ComponentFixture<AddTicketFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddTicketFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTicketFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
