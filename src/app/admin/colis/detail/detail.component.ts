import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {Colis} from "../../../models/colis.model";
import {ColisService} from "../../../services/colis.service";
import {showHttpError} from "../../../utils/message.util";

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

  headerAnimated = false;
  cardAnimated = false;
  itemsAnimated = false;

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

  goBack(): void {
    this.router.navigate(['/colis']);
  }

  editColis(): void {
    console.log('Edit colis:', this.colis);
  }

  printColis(): void {
    window.print();
  }
}
