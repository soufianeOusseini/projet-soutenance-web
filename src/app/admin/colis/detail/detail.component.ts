import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Colis} from "../../../models/colis.model";
import {ColisService} from "../../../services/colis.service";
import {showHttpError, showSuccess} from "../../../utils/message.util";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  standalone: false
})
export class DetailComponent implements OnInit {
  colis: Colis | null = null;
  loading = true;
  error = false;
  colisId: number = 0;
  updatingStatus = false;

  headerAnimated = false;
  cardAnimated = false;
  itemsAnimated = false;

  // Options de statut disponibles
  statusOptions = [
    { value: 'EN_ATTENTE', label: 'En attente', icon: 'ri-time-line' },
    { value: 'EN_TRANSIT', label: 'En transit', icon: 'ri-truck-line' },
    { value: 'LIVRE', label: 'Livré', icon: 'ri-checkbox-circle-line' },
    { value: 'ANNULE', label: 'Annulé', icon: 'ri-close-circle-line' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private colisService: ColisService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.colisId = +params['id'];
      this.loadColisDetail();
    });

    setTimeout(() => this.headerAnimated = true, 100);
    setTimeout(() => this.cardAnimated = true, 300);
    setTimeout(() => this.itemsAnimated = true, 500);
  }

  loadColisDetail(): void {
    this.colisService.getById(this.colisId).subscribe({
      next: (data) => {
        this.colis = data;
        this.loading = false;
      },
      error: (error) => {
        showHttpError(error)
        console.error('Erreur lors du chargement du colis:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  // Nouvelle méthode pour changer le statut
  updateStatus(newStatus: string): void {
    if (!this.colis || this.updatingStatus) return;

    this.updatingStatus = true;

    this.colisService.updateStatus(this.colisId, newStatus).subscribe({
      next: (updatedColis) => {
        this.colis = updatedColis;
        this.updatingStatus = false;
        showSuccess('Statut mis à jour avec succès');
      },
      error: (error) => {
        showHttpError(error);
        this.updatingStatus = false;
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }

  // Méthode pour obtenir les statuts suivants possibles
  getAvailableStatusTransitions(): any[] {
    if (!this.colis?.status) return this.statusOptions;

    const currentStatus = this.colis.status;

    // Définir les transitions possibles selon la logique métier
    switch (currentStatus) {
      case 'EN_ATTENTE':
        return this.statusOptions.filter(s => ['EN_TRANSIT', 'ANNULE'].includes(s.value));
      case 'EN_TRANSIT':
        return this.statusOptions.filter(s => ['LIVRE', 'ANNULE'].includes(s.value));
      case 'LIVRE':
        return []; // Aucune transition possible depuis LIVRE
      case 'ANNULE':
        return this.statusOptions.filter(s => ['EN_ATTENTE'].includes(s.value));
      default:
        return this.statusOptions;
    }
  }

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'badge bg-secondary';

    switch (status) {
      case 'EN_ATTENTE':
        return 'badge bg-warning';
      case 'EN_TRANSIT':
        return 'badge bg-info';
      case 'LIVRE':
        return 'badge bg-success';
      case 'ANNULE':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getStatusIcon(status: string | undefined): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'ri-time-line';
      case 'EN_TRANSIT':
        return 'ri-truck-line';
      case 'LIVRE':
        return 'ri-checkbox-circle-line';
      case 'ANNULE':
        return 'ri-close-circle-line';
      default:
        return 'ri-question-line';
    }
  }

  getStatusLabel(status: string | undefined): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption?.label || status || 'Inconnu';
  }

  getProgressPercentage(status: string | undefined): number {
    switch (status) {
      case 'EN_ATTENTE':
        return 25;
      case 'EN_TRANSIT':
        return 75;
      case 'LIVRE':
        return 100;
      case 'ANNULE':
        return 0;
      default:
        return 0;
    }
  }

  // Méthode pour calculer les statistiques
  getStatistics() {
    if (!this.colis || !this.colis.colisItems) {
      return {
        totalItems: 0,
        totalValue: 0
      };
    }

    const totalItems = this.colis.colisItems.length;
    const totalValue = this.colis.prix || 0;

    return {
      totalItems,
      totalValue
    };
  }

  // Méthodes pour la timeline
  isStatusActive(status: string): boolean {
    if (!this.colis?.status) return false;

    const statusOrder = ['EN_ATTENTE', 'EN_TRANSIT', 'LIVRE'];
    const currentIndex = statusOrder.indexOf(this.colis.status);
    const checkIndex = statusOrder.indexOf(status);

    // Si le colis est annulé, seul ANNULE est actif
    if (this.colis.status === 'ANNULE') {
      return status === 'ANNULE';
    }

    // Sinon, les statuts sont actifs s'ils sont <= au statut actuel
    return checkIndex <= currentIndex;
  }

  shouldShowTimelineStep(status: string): boolean {
    if (!this.colis?.status) return true;

    // Toujours montrer le statut annulé s'il est actuel
    if (this.colis.status === 'ANNULE' && status === 'ANNULE') {
      return true;
    }

    // Ne pas montrer annulé si le colis n'est pas annulé
    if (status === 'ANNULE' && this.colis.status !== 'ANNULE') {
      return false;
    }

    return true;
  }

  goBack(): void {
    this.router.navigate(['admin/colis']);
  }

  editColis(): void {
    console.log('Edit colis:', this.colis);
    // Naviguer vers la page d'édition
    this.router.navigate(['admin/colis/edit', this.colisId]);
  }

  printColis(): void {
    window.print();
  }
}
