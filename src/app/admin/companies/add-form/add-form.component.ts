import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {CompanieModel} from "../../../models/companie.model";
import {CompaniesService} from "../../../services/companies.service";

@Component({
    selector: 'app-add-form',
    templateUrl: './add-form.component.html',
    styleUrl: './add-form.component.css',
    standalone: false
})
export class AddFormComponent implements OnInit {
  companies: CompanieModel = new CompanieModel();
  formGroup: FormGroup = new FormGroup({}) ;
  constructor(public activeModal: NgbActiveModal,private fb: FormBuilder,private companiesService: CompaniesService) {}

  ngOnInit(): void {
    this.formGroup = this.createForm()
  }
  save(): void {
    this.companiesService
      .save(this.formGroup.value)
      .subscribe({
        next: (data) => {
          this.activeModal.close()
        },
        error: (error) => {
          console.error(error)
        },
      })
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.companies.id],
      name: [this.companies.name],
      email: [this.companies.email],
      phone_number: [this.companies.phone_number],
      address: [this.companies.address],
    })
  }

  reset(): void {
    this.formGroup.reset()
  }

  close(): void {
    this.activeModal.close()
  }
}
