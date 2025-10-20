import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AgencyModel} from "../../../models/agency";
import {AgencyService} from "../../../services/agency.service";
import {CompaniesService} from "../../../services/companies.service";
import {CompanieModel} from "../../../models/companie.model";
import {showHttpError, showSuccess} from "../../../utils/message.util";

@Component({
  selector: 'app-add-agency-form',
  standalone: false,
  templateUrl: './add-agency-form.component.html',
  styleUrl: './add-agency-form.component.css'
})
export class AddAgencyFormComponent implements OnInit {
  @Input() agency: AgencyModel | undefined;
  @Input() isEditMode: boolean = false;

  formGroup: FormGroup = new FormGroup({});
  companies: CompanieModel[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private agencyService: AgencyService,
    private companiesService: CompaniesService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.formGroup = this.createForm();

    if (this.isEditMode && this.agency) {
      this.formGroup.patchValue(this.agency);
    }
  }

  loadCompanies(): void {
    this.companiesService.getAll().subscribe({
      next: (data) => {
        this.companies = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des compagnies', error);
      }
    });
  }

  save(): void {
    if (this.formGroup.invalid) {
      this.markFormGroupTouched(this.formGroup);
      return;
    }

    const operation = this.isEditMode
      ? this.agencyService.updateAgency(this.agency?.id!, this.formGroup.value)
      : this.agencyService.createAgency(this.formGroup.value);

    operation.subscribe({
      next: (data) => {
        showSuccess();
        this.activeModal.close('success');
      },
      error: (error) => {
        showHttpError(error);
        console.error(error);
      },
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.agency?.id],
      name: [this.agency?.name, [Validators.required]],
      code: [this.agency?.code, [Validators.required]],
      telephone: [this.agency?.telephone, [Validators.required]],
      email: [this.agency?.email, [Validators.email]],
      city: [this.agency?.city, [Validators.required]],
      region: [this.agency?.region],
      address: [this.agency?.address],
      managerName: [this.agency?.managerName],
      managerPhone: [this.agency?.managerPhone],
      status: [this.agency?.status || 'ACTIVE'],
      companyId: [this.agency?.companyId, this.isEditMode ? [] : [Validators.required]]
    });
  }

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
    this.formGroup.patchValue({ status: 'ACTIVE' });
  }

  close(): void {
    this.activeModal.close();
  }
}
