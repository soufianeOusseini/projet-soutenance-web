import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPermissionToAccessComponent } from './add-permission-to-access.component';

describe('AddPermissionToAccessComponent', () => {
  let component: AddPermissionToAccessComponent;
  let fixture: ComponentFixture<AddPermissionToAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPermissionToAccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPermissionToAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
