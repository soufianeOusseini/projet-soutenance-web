import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DashboardStats} from "../../models/super-dashboard-stats";
import {DashboardService} from "../../services/dashboard.service";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
@Component({
  selector: 'app-statistique',
  standalone: false,
  templateUrl: './statistique.component.html',
  styleUrl: './statistique.component.css'
})
export class StatistiqueComponent  implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChart!: ElementRef<HTMLCanvasElement>;

  stats: DashboardStats | null = null;
  loading: boolean = true;
  chart: Chart | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  ngAfterViewInit(): void {
    // Le graphique sera créé après le chargement des données
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        // Attendre que la vue soit mise à jour
        setTimeout(() => this.createChart(), 100);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques', error);
        this.loading = false;
      }
    });
  }

  createChart(): void {
    if (!this.stats || !this.salesChart) return;

    const ctx = this.salesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Détruire le graphique existant s'il existe
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.stats.monthlySales.map(m => m.month);
    const data = this.stats.monthlySales.map(m => m.sales);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventes (FCFA)',
          data: data,
          borderColor: '#1e3a5f',
          backgroundColor: 'rgba(30, 58, 95, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1e3a5f',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#1e3a5f',
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Ventes: ' + context.parsed.y!.toLocaleString('fr-FR') + ' FCFA';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return (value as number).toLocaleString('fr-FR') + ' FCFA';
              }
            }
          }
        }
      }
    });
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
