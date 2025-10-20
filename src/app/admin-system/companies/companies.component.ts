import {Component, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AddFormComponent} from "./add-form/add-form.component";
import {CompaniesService} from "../../services/companies.service";
import {CompanieModel} from "../../models/companie.model";
import {ConfirmationDialogComponent} from "../../utils/confirm-dialog";
import {CompanyStatus} from "../../models/enums/company-status";
import {showHttpError, showSuccess} from "../../utils/message.util";
import {ConfirmDeleteComponent} from "../../utils/confirm-delete/confirm-delete.component";

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css',
  standalone: false
})
export class CompaniesComponent implements OnInit {
  companies: CompanieModel[] = [];
  isLoading: boolean = false;

  constructor(
    private modalService: NgbModal,
    private companiesService: CompaniesService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.companiesService.getAll().subscribe({
      next: (data) => {
        this.companies = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des compagnies', error);
        this.isLoading = false;
      }
    });
  }

  add(): void {
    const modalRef = this.modalService.open(AddFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addContactLabel'
    });

    modalRef.componentInstance.isEditMode = false;

    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.loadCompanies();
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }

  edit(company: CompanieModel): void {
    const modalRef = this.modalService.open(AddFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addContactLabel'
    });

    modalRef.componentInstance.company = {...company};
    modalRef.componentInstance.isEditMode = true;

    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.loadCompanies();
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }


  delete(value: any): void {
    this.companiesService
      .delete(value)
      .subscribe({
        next: (data) => {
          showSuccess()
          this.loadCompanies();
        },
        error: (error) => {
          showHttpError(error)
          console.error(error)
        },
      })
  }

  confirmDelete(id: any) {
    const modalRef = this.modalService.open(ConfirmDeleteComponent, {
      centered: true,
    })
    modalRef.result.then(
      (result) => {
        this.delete(id)
      },
      (error) => {
        console.error(error)
      },
    )
  }

  changeStatus(id: number): void {
    this.isLoading = true;
    this.companiesService.changeStatus(id).subscribe({
      next: () => {
        this.loadCompanies();
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
  getStatusLabel(status: CompanyStatus | undefined): string {
    switch (status) {
      case CompanyStatus.ACTIVE:
        return 'Actif';
      case CompanyStatus.INACTIVE:
        return 'Inactif';
      default:
        return 'Inconnu';
    }
  }

  protected readonly CompanyStatus = CompanyStatus;
}
