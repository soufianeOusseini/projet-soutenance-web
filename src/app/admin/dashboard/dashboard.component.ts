import { Component, OnInit } from '@angular/core';
import {Dashboard, DashboardService} from "../../services/dashboard.service";
import {Subject, takeUntil} from "rxjs";
import {AuthService} from "../../auth/service/auth.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: false
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard | null = null;
  loading: boolean = true;
  error: string | null = null;
  currentUser: any
  private _unsubscribeAll: Subject<any> = new Subject();
  constructor(private dashboardService: DashboardService,private authService: AuthService,) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadUserData()
  }
  loadUserData(): void {
    this.authService.getCurrentUser()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.currentUser = data;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des données utilisateur:', error);
        }
      });
  }
  loadDashboard(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du dashboard';
        this.loading = false;
        console.error('Dashboard error:', err);
      }
    });
  }

  /**
   * Retourne la valeur maximale des revenus pour normaliser les barres du graphique
   */
  getMaxRevenue(revenues: any[]): number {
    if (!revenues || revenues.length === 0) return 1;
    return Math.max(...revenues.map(r => r.amount || 0)) || 1;
  }

  /**
   * Retourne le nombre maximum de trajets pour normaliser les barres
   */
  getMaxTrajetCount(trajets: any[]): number {
    if (!trajets || trajets.length === 0) return 1;
    return Math.max(...trajets.map(t => t.count || 0)) || 1;
  }

  /**
   * Retourne l'icône correspondante au type d'activité
   */
  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'TICKET': 'bi bi-ticket-perforated',
      'RESERVATION': 'bi bi-calendar-check',
      'COLIS': 'bi bi-box-seam',
      'TRAJET': 'bi bi-map'
    };
    return iconMap[type] || 'bi bi-bell';
  }

  /**
   * Rafraîchit les données du dashboard
   */
  refreshDashboard(): void {
    this.loading = true;
    this.loadDashboard();
  }
}
