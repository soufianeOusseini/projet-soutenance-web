import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {Driver} from "../../../models/driver.model";
import {DriverService} from "../../../services/driver.service";
import {DriverStatus} from "../../../models/enums/driver-status";
import {UserProfile} from "../../../models/enums/user-profile";
import {showHttpError, showSuccess} from "../../../utils/message.util";

@Component({
  selector: 'app-form-driver',
  standalone: false,
  templateUrl: './form-driver.component.html',
  styleUrl: './form-driver.component.css'
})
export class FormDriverComponent implements OnInit {
  driver: Driver = new Driver();
  formGroup: FormGroup = new FormGroup({});
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private driverService: DriverService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.createForm();
    this.isEditMode = !!this.driver.id;
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.driver.id],
      firstName: [this.driver.user?.firstName, [Validators.required]],
      lastName: [this.driver.user?.lastName, [Validators.required]],
      email: [this.driver.user?.username, [Validators.required, Validators.email]],
      phone: [this.driver.user?.phone, [Validators.required]],
      driverLicenseNumber: [this.driver.driverLicenseNumber, [Validators.required]],
      licenseExpiryDate: [this.driver.licenseExpiryDate],
      birthDate: [this.driver.user?.birthDate, [Validators.required]],
      birthPlace: [this.driver.user?.birthPlace, [Validators.required]],
      status: [DriverStatus.ACTIVE],
      isAvailable: [true]
    });
  }

  save(): void {
    if (this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formData = this.prepareFormData();

    this.driverService
      .save(formData)
      .subscribe({
        next: (data) => {
          showSuccess()
          this.activeModal.close('saved');
        },
        error: (error) => {
          showHttpError(error)
          console.error(error);
          this.activeModal.close('error');
        },
      });
  }

  update(): void {
    if (this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formData = this.prepareFormData();

    this.driverService
      .save(formData)
      .subscribe({
        next: (data) => {
          showSuccess()
          this.activeModal.close('updated');
        },
        error: (error) => {
          showHttpError(error)
          console.error(error);
          this.activeModal.close('error');
        },
      });
  }

  private prepareFormData(): any {
    const formValue = this.formGroup.value;

    return {
      id: formValue.id,
      driverLicenseNumber: formValue.driverLicenseNumber,
      licenseExpiryDate: formValue.licenseExpiryDate,
      status: formValue.status,
      isAvailable: formValue.isAvailable,
      user: {
        id: this.driver.user?.id,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        birthPlace: formValue.birthPlace,
        birthDate: formValue.birthDate,
        username: formValue.username,
        password: formValue.password,
        profile: UserProfile.DRIVER,
      }
    };
  }

  reset() {
    this.formGroup.reset();
    this.formGroup.patchValue({
      status: 'ACTIVE',
      isAvailable: true
    });
  }

  close() {
    this.activeModal.close('closed');
  }

  get firstName() { return this.formGroup.get('firstName'); }
  get lastName() { return this.formGroup.get('lastName'); }
  get email() { return this.formGroup.get('email'); }
  get phone() { return this.formGroup.get('phone'); }
  get username() { return this.formGroup.get('username'); }
  get password() { return this.formGroup.get('password'); }
  get driverLicenseNumber() { return this.formGroup.get('driverLicenseNumber'); }
  get licenseExpiryDate() { return this.formGroup.get('licenseExpiryDate'); }
  get status() { return this.formGroup.get('status'); }
  get isAvailable() { return this.formGroup.get('isAvailable'); }
  get birthDate(){return this.formGroup.get('birthDate'); }
  get birthPlace(){return this.formGroup.get('birthPlace'); }
}
