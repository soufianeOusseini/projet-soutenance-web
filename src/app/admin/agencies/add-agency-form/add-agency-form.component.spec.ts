import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAgencyFormComponent } from './add-agency-form.component';

describe('AddAgencyFormComponent', () => {
  let component: AddAgencyFormComponent;
  let fixture: ComponentFixture<AddAgencyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddAgencyFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAgencyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
