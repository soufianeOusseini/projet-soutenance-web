import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDriverComponent } from './form-driver/form-driver.component';
import {Driver} from "../../models/driver.model";
import {DriverService} from "../../services/driver.service";
import {DriverStatus} from "../../models/enums/driver-status";

@Component({
  selector: 'app-driver',
  standalone: false,
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.css'
})
export class DriverComponent implements OnInit {
  drivers: Driver[] = [];
  loading: boolean = false;

  constructor(
    private modalService: NgbModal,
    private driverService: DriverService
  ) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loading = true;
    this.driverService.getAll().subscribe({
      next: (data) => {
        this.drivers = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading drivers', error);
        this.loading = false;
      }
    });
  }

  add() {
    const modalRef = this.modalService.open(FormDriverComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addDriverLabel'
    });

    modalRef.result.then(
      (result) => {
        console.log(`Fermé avec: ${result}`);
        if (result === 'saved' || result === 'updated') {
          this.loadDrivers(); // Recharger les chauffeurs après ajout/modification
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }

  edit(driver: Driver) {
    const modalRef = this.modalService.open(FormDriverComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addDriverLabel'
    });

    // Passer les données du chauffeur au composant modal
    modalRef.componentInstance.driver = { ...driver };
    modalRef.componentInstance.isEditMode = true;

    modalRef.result.then(
      (result) => {
        console.log(`Fermé avec: ${result}`);
        if (result === 'saved' || result === 'updated') {
          this.loadDrivers(); // Recharger les chauffeurs après modification
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }

  delete(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur?')) {
      this.driverService.delete(id).subscribe({
        next: () => {
          this.loadDrivers(); // Recharger les chauffeurs après suppression
        },
        error: (error) => {
          console.error('Error deleting driver', error);
        }
      });
    }
  }

  // Méthodes utilitaires pour l'affichage
  getFullName(driver: Driver): string {
    if (!driver.user) return '';
    return `${driver.user.firstName || ''} ${driver.user.lastName || ''}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getStatusLabel(status: DriverStatus | undefined): string {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'INACTIVE': return 'Inactif';
      case 'SUSPENDED': return 'Suspendu';
      default: return '';
    }
  }

  getStatusClass(status: DriverStatus | undefined): string {
    switch (status) {
      case 'ACTIVE': return 'badge bg-success';
      case 'INACTIVE': return 'badge bg-secondary';
      case 'SUSPENDED': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getLicenseExpiryClass(expiryDate: string | undefined): string {
    if (!expiryDate) return 'text-muted';

    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-danger fw-bold'; // Expiré
    if (diffDays <= 30) return 'text-warning fw-bold'; // Expire bientôt
    return 'text-success'; // Valide
  }
}
