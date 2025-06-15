import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStaffFormComponent } from './add-staff-form.component';

describe('AddStaffFormComponent', () => {
  let component: AddStaffFormComponent;
  let fixture: ComponentFixture<AddStaffFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddStaffFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStaffFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
