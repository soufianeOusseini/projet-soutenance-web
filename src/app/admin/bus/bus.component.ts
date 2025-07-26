import {Component, OnInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AddBusFormComponent} from "./add-form/add-bus-form.component";
import {BusService} from "../../services/bus.service";
import {Bus} from "../../models/bus.model";
import {BusStatus} from "../../models/enums/bus-status";
import {showHttpError, showSuccess} from "../../utils/message.util";
import {ConfirmDeleteComponent} from "../../utils/confirm-delete/confirm-delete.component";

@Component({
  selector: 'app-bus',
  templateUrl: './bus.component.html',
  standalone: false,
  styleUrl: './bus.component.css'
})
export class BusComponent implements OnInit {
  buses: Bus[] = [];
  isLoading = false;

  constructor(
    private modalService: NgbModal,
    private busService: BusService,
  ) {}

  ngOnInit(): void {
    this.loadBuses();
  }

  loadBuses(): void {
    this.isLoading = true;
    this.busService.getAll().subscribe({
      next: (data) => {
        this.buses = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des bus', error);
        this.isLoading = false;
      }
    });
  }

  add() {
    const modalRef = this.modalService.open(AddBusFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addContactLabel'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadBuses(); // Recharger la liste après ajout
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }

  edit(bus: Bus): void {
    const modalRef = this.modalService.open(AddBusFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'editContactLabel'
    });

    modalRef.componentInstance.bus = bus;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadBuses();
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }


  delete(value: any): void {
    this.busService
      .delete(value)
      .subscribe({
        next: (data) => {
          showSuccess()
          this.loadBuses()
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

  getStatusBadgeClass(status: string | undefined): string {
    return status === 'ACTIVE'
      ? 'badge border border-success text-success'
      : 'badge border border-danger text-danger';
  }

  getStatusText(status: string | undefined): string {
    return status === 'ACTIVE' ? 'Disponible' : 'Non disponible';
  }

  getStatusLabel(status: BusStatus | undefined): string {
    switch (status) {
      case BusStatus.ACTIVE:
        return 'Actif';
      case BusStatus.IN_MAINTENANCE:
        return 'En maintenance';
      case BusStatus.AVAILABLE:
        return 'Disponible';
        case BusStatus.CLEANING:
          return 'Nettoyage'
      case BusStatus.IN_TRANSIT:
        return 'En transi';

      default:

        return 'Inconnu';
    }
  }
}
