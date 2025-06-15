import { Component, OnInit } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddBusFormComponent } from "./add-form/add-bus-form.component";
import { BusService } from "../../services/bus.service";
import { Bus } from "../../models/bus.model";

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

  toggleStatus(bus: Bus): void {
    // Inverser le statut du bus
    // const newStatus = bus.status === 'AVAILABLE' ? 'NOT_AVAILABLE' : BusStatus.AVAILABLE;
    //
    // this.busService.updateStatus(id, newStatus).subscribe({
    //   next: () => {
    //     this.toastr.success(`Statut du bus modifié avec succès`, 'Succès');
    //     this.loadBuses(); // Recharger la liste pour obtenir les données à jour
    //   },
    //   error: (error) => {
    //     console.error('Erreur lors de la modification du statut', error);
    //     this.toastr.error('Impossible de modifier le statut du bus', 'Erreur');
    //   }
    // });
  }

  delete(id: number| undefined): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bus?')) {
      this.busService.delete(id!).subscribe({
        next: () => {
          this.loadBuses(); // Recharger la liste après suppression
        },
        error: (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      });
    }
  }

  getStatusBadgeClass(status: string | undefined): string {
    return status === 'ACTIVE'
      ? 'badge border border-success text-success'
      : 'badge border border-danger text-danger';
  }

  getStatusText(status: string | undefined): string {
    return status === 'ACTIVE' ? 'Disponible' : 'Non disponible';
  }
}
