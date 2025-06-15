import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTrajetFormComponent } from './add-trajet-form.component';

describe('AddFormComponent', () => {
  let component: AddTrajetFormComponent;
  let fixture: ComponentFixture<AddTrajetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddTrajetFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTrajetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
