import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddColisFormComponent } from "./add-form/add-colis-form.component";
import { ColisService } from "../../services/colis.service";
import { Colis } from "../../models/colis.model";
import {Router} from "@angular/router";
import {ColisStatus} from "../../models/enums/colis-status";
import {ConfirmDeleteComponent} from "../../utils/confirm-delete/confirm-delete.component";
import {showHttpError, showSuccess} from "../../utils/message.util";

@Component({
  selector: 'app-colis',
  templateUrl: './colis.component.html',
  standalone: false,
  styleUrls: ['./colis.component.css']
})
export class ColisComponent implements OnInit {
  @ViewChild('confirmDeleteModal') confirmDeleteModal!: TemplateRef<any>;

  allColis: Colis[] = [];
  filteredColis: Colis[] = [];

  colisToDelete: Colis | null = null;

  searchTerm: string = '';
  statusFilter: string = '';
  statusOptions: string[] = ['EN_ATTENTE', 'EN_TRANSIT', 'LIVRE', 'ANNULE'];

  constructor(
    private modalService: NgbModal,
    private colisService: ColisService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadColis();
  }

  loadColis(): void {
    this.colisService.getAll().subscribe({
      next: (data) => {
        this.allColis = data;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des colis:', error);
      }
    });
  }

  applyFilter(): void {
    let result = [...this.allColis];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(colis =>
        colis.numero?.toLowerCase().includes(term) ||
        colis.expediteur?.toLowerCase().includes(term) ||
        colis.destinateur?.toLowerCase().includes(term) ||
        colis.lieuEnvoi?.toLowerCase().includes(term) ||
        colis.lieuReception?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      result = result.filter(colis => colis.status === this.statusFilter);
    }

    this.filteredColis = result;
  }

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'badge border border-secondary text-secondary';

    switch (status) {
      case 'EN_ATTENTE':
        return 'badge border border-warning text-warning';
      case 'EN_TRANSIT':
        return 'badge border border-info text-info';
      case 'LIVRE':
        return 'badge border border-success text-success';
      case 'ANNULE':
        return 'badge border border-danger text-danger';
      default:
        return 'badge border border-secondary text-secondary';
    }
  }

  add(): void {
    const modalRef = this.modalService.open(AddColisFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addContactLabel'
    });

    modalRef.result.then(
      () => {
        this.loadColis();
      },
      () => {
      }
    );
  }

  edit(colis: Colis): void {
    this.colisService.getById(colis.id!).subscribe({
      next: (data) => {
        const modalRef = this.modalService.open(AddColisFormComponent, {
          size: 'lg',
          centered: true,
          backdrop: 'static',
          keyboard: true,
          ariaLabelledBy: 'addContactLabel'
        });

        modalRef.componentInstance.colis = data;

        modalRef.result.then(
          () => {
            this.loadColis();
          },
          () => {
          }
        );
      },
      error: (error) => {
        console.error('Erreur lors du chargement du colis:', error);
      }
    });
  }

  delete(value: any): void {
    this.colisService
      .delete(value)
      .subscribe({
        next: (data) => {
          showSuccess()
          this.loadColis()
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

  show(colis: Colis): void {
    this.router.navigate(['admin/colis/detail/', colis.id]);
  }

  getStatusLabel(status: ColisStatus | undefined): string {
    switch (status) {
      case ColisStatus.EN_ATTENTE:
        return 'En attente';
      case ColisStatus.EN_TRANSIT:
        return 'En route';
        case ColisStatus.ANNULE:
          return 'Annulé';
          case ColisStatus.LIVRE:
            return 'Livré';
      default:
        return 'Inconnu';
    }
  }
}
