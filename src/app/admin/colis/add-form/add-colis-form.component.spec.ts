import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFormComponent } from './add-colis-form.component';

describe('AddFormComponent', () => {
  let component: AddFormComponent;
  let fixture: ComponentFixture<AddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
