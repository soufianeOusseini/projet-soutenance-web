import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {CompanieModel} from "../../../models/companie.model";
import {CompaniesService} from "../../../services/companies.service";

@Component({
  selector: 'app-add-form',
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.css',
  standalone: false
})
export class AddFormComponent implements OnInit {
  @Input() company: CompanieModel = new CompanieModel();
  @Input() isEditMode: boolean = false;

  formGroup: FormGroup = new FormGroup({});

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private companiesService: CompaniesService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.createForm();

    if (this.isEditMode && this.company) {
      this.formGroup.patchValue(this.company);
    }
  }

  save(): void {
    if (this.formGroup.invalid) {
      this.markFormGroupTouched(this.formGroup);
      return;
    }

    const operation = this.isEditMode ?
      this.companiesService.save(this.formGroup.value) :
      this.companiesService.save(this.formGroup.value);

    operation.subscribe({
      next: (data) => {
        this.activeModal.close('success');
      },
      error: (error) => {
        console.error(error);
        this.activeModal.close('error');
      },
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.company.id],
      name: [this.company.name, [Validators.required]],
      email: [this.company.email, [Validators.required, Validators.email]],
      telephone: [this.company.telephone, [Validators.required]],
      address: [this.company.address, [Validators.required]],
      city: [this.company.city, [Validators.required]],
      region: [this.company.region, [Validators.required]],
      postalCode: [this.company.postalCode, [Validators.required]],
      adminFirstName: [this.company.adminFirstName, [Validators.required]],
      adminLastName: [this.company.adminLastName, [Validators.required]],
      adminPhone: [this.company.adminPhone, [Validators.required]],
      adminEmail: [this.company.adminEmail, [Validators.required, Validators.email]],
      status: [this.company.status],
    });
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  reset(): void {
    this.formGroup.reset();
  }

  close(): void {
    this.activeModal.close();
  }
}
