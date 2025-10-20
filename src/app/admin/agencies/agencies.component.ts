import {Component, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AgencyService} from "../../services/agency.service";
import {AgencyModel} from "../../models/agency";
import {showHttpError, showSuccess} from "../../utils/message.util";
import {ConfirmDeleteComponent} from "../../utils/confirm-delete/confirm-delete.component";
import {AddAgencyFormComponent} from "./add-agency-form/add-agency-form.component";

@Component({
  selector: 'app-agencies',
  templateUrl: './agencies.component.html',
  styleUrl: './agencies.component.css',
  standalone: false
})
export class AgenciesComponent implements OnInit {
  agencies: AgencyModel[] = [];
  isLoading: boolean = false;

  constructor(
    private modalService: NgbModal,
    private agencyService: AgencyService
  ) {}

  ngOnInit(): void {
    this.loadAgencies();
  }

  loadAgencies(): void {
    this.isLoading = true;
    this.agencyService.getAgenciesByCompany().subscribe({
      next: (data) => {
        this.agencies = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des agences', error);
        showHttpError(error);
        this.isLoading = false;
      }
    });
  }

  add(): void {
    const modalRef = this.modalService.open(AddAgencyFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addAgencyLabel'
    });

    modalRef.componentInstance.isEditMode = false;

    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.loadAgencies();
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }

  edit(agency: AgencyModel): void {
    const modalRef = this.modalService.open(AddAgencyFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addAgencyLabel'
    });

    modalRef.componentInstance.agency = {...agency};
    modalRef.componentInstance.isEditMode = true;

    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.loadAgencies();
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }

  delete(id: any): void {
    this.agencyService.deleteAgency(id).subscribe({
      next: (data) => {
        showSuccess();
        this.loadAgencies();
      },
      error: (error) => {
        showHttpError(error);
        console.error(error);
      },
    });
  }

  confirmDelete(id: any) {
    const modalRef = this.modalService.open(ConfirmDeleteComponent, {
      centered: true,
    });
    modalRef.result.then(
      (result) => {
        this.delete(id);
      },
      (error) => {
        console.error(error);
      },
    );
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'SUSPENDED': 'Suspendu',
      'PENDING': 'En attente'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'ACTIVE': 'success',
      'INACTIVE': 'secondary',
      'SUSPENDED': 'warning',
      'PENDING': 'info'
    };
    return classMap[status] || 'secondary';
  }
}
