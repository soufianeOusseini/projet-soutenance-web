import {Component, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AddFormComponent} from "./add-form/add-form.component";
import {CompaniesService} from "../../services/companies.service";
import {CompanieModel} from "../../models/companie.model";
import {ConfirmationDialogComponent} from "../../utils/confirm-dialog";
import {CompanyStatus} from "../../models/enums/company-status";

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

  confirmDelete(company: CompanieModel): void {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Confirmation de suppression';
    modalRef.componentInstance.message = `Êtes-vous sûr de vouloir supprimer la compagnie "${company.name}" ?`;

    modalRef.result.then(
      (result) => {
        if (result === 'Confirm') {
          this.delete(company.id!);
        }
      },
      () => {}
    );
  }

  delete(id: number): void {
    this.isLoading = true;
    this.companiesService.delete(id).subscribe({
      next: () => {
        this.loadCompanies();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la compagnie', error);
        this.isLoading = false;
      }
    });
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
