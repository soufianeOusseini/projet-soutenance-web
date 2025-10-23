import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import {Subscription} from "../../../models/subscription";
import {CompanieModel} from "../../../models/companie.model";
import {SubscriptionService} from "../../../services/subscription.service";
import {CompaniesService} from "../../../services/companies.service";
import {SubscriptionFormComponent} from "./subscription-form/subscription-form.component";
import {InvoiceListComponent} from "../invoice/invoice-list/invoice-list.component";

@Component({
  selector: 'app-subscription',
  standalone: false,
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit {
  subscriptions: Subscription[] = [];
  filteredSubscriptions: Subscription[] = [];
  companies: CompanieModel[] = [];
  selectedCompanyId: number | null = null;
  filterStatus = 'all';
  loading = false;

  stats = {
    active: 0,
    expiring: 0,
    expired: 0,
    total: 0
  };

  constructor(
    private subscriptionService: SubscriptionService,
    private companyService: CompaniesService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadAllSubscriptions();
  }

  loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (data) => {
        this.companies = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des compagnies', error);
      }
    });
  }

  loadAllSubscriptions(): void {
    this.loading = true;
    // Charger tous les abonnements (vous pouvez ajuster selon vos besoins)
    this.subscriptionService.getExpiringSubscriptions(365).subscribe({
      next: (data) => {
        this.subscriptions = data;
        this.calculateStats();
        this.filterSubscriptions();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des abonnements', error);
        this.loading = false;
        Swal.fire('Erreur', 'Impossible de charger les abonnements', 'error');
      }
    });
  }

  filterSubscriptions(): void {
    let filtered = [...this.subscriptions];

    // Filtrer par compagnie
    if (this.selectedCompanyId) {
      filtered = filtered.filter(s => s.companyId === this.selectedCompanyId);
    }

    // Filtrer par statut
    if (this.filterStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter(s => {
        const endDate = new Date(s.endDate!);
        const daysRemaining = this.calculateDaysRemaining(endDate);

        switch (this.filterStatus) {
          case 'active':
            return s.active && daysRemaining > 7;
          case 'inactive':
            return !s.active;
          case 'expiring':
            return s.active && daysRemaining <= 7 && daysRemaining >= 0;
          default:
            return true;
        }
      });
    }

    this.filteredSubscriptions = filtered;
  }

  calculateStats(): void {
    const now = new Date();

    this.stats.total = this.subscriptions.length;
    this.stats.active = 0;
    this.stats.expiring = 0;
    this.stats.expired = 0;

    this.subscriptions.forEach(sub => {
      const endDate = new Date(sub.endDate!);
      const daysRemaining = this.calculateDaysRemaining(endDate);

      if (sub.active) {
        if (daysRemaining <= 7 && daysRemaining >= 0) {
          this.stats.expiring++;
        } else if (daysRemaining > 0) {
          this.stats.active++;
        }
      } else {
        this.stats.expired++;
      }
    });
  }

  getDaysRemaining(subscription: Subscription): string {
    const endDate = new Date(subscription.endDate!);
    const days = this.calculateDaysRemaining(endDate);

    if (days < 0) {
      return 'Expiré';
    } else if (days === 0) {
      return 'Expire aujourd\'hui';
    } else if (days === 1) {
      return '1 jour';
    } else {
      return `${days} jours`;
    }
  }

  calculateDaysRemaining(endDate: Date): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diff = endDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getDaysRemainingClass(subscription: Subscription): string {
    const endDate = new Date(subscription.endDate!);
    const days = this.calculateDaysRemaining(endDate);

    if (days < 0) {
      return 'badge bg-danger';
    } else if (days <= 7) {
      return 'badge bg-warning';
    } else {
      return 'badge bg-success';
    }
  }

  getStatusBadgeClass(subscription: Subscription): string {
    if (!subscription.active) {
      return 'bg-secondary';
    }

    const endDate = new Date(subscription.endDate!);
    const days = this.calculateDaysRemaining(endDate);

    if (days < 0) {
      return 'bg-danger';
    } else if (days <= 7) {
      return 'bg-warning';
    } else {
      return 'bg-success';
    }
  }

  getStatusLabel(subscription: Subscription): string {
    if (subscription.cancelledAt) {
      return 'Annulé';
    }
    if (!subscription.active) {
      return 'Inactif';
    }

    const endDate = new Date(subscription.endDate!);
    const days = this.calculateDaysRemaining(endDate);

    if (days < 0) {
      return 'Expiré';
    } else if (days <= 7) {
      return 'Expire bientôt';
    } else {
      return 'Actif';
    }
  }

  add(): void {
    const modalRef = this.modalService.open(SubscriptionFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadAllSubscriptions();
        }
      },
      () => {}
    );
  }

  renew(subscription: Subscription): void {
    Swal.fire({
      title: 'Renouveler l\'abonnement',
      text: `Voulez-vous renouveler l'abonnement de ${subscription.companyName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, renouveler',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptionService.renewSubscription({
          subscriptionId: subscription.id!,
          planId: subscription.planId
        }).subscribe({
          next: () => {
            Swal.fire('Succès', 'Abonnement renouvelé avec succès', 'success');
            this.loadAllSubscriptions();
          },
          error: (error) => {
            console.error('Erreur', error);
            Swal.fire('Erreur', 'Impossible de renouveler l\'abonnement', 'error');
          }
        });
      }
    });
  }

  cancel(subscription: Subscription): void {
    Swal.fire({
      title: 'Annuler l\'abonnement',
      text: `Êtes-vous sûr de vouloir annuler l'abonnement de ${subscription.companyName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptionService.cancelSubscription(subscription.id!).subscribe({
          next: () => {
            Swal.fire('Succès', 'Abonnement annulé avec succès', 'success');
            this.loadAllSubscriptions();
          },
          error: (error) => {
            console.error('Erreur', error);
            Swal.fire('Erreur', 'Impossible d\'annuler l\'abonnement', 'error');
          }
        });
      }
    });
  }

  viewInvoices(subscription: Subscription): void {
    const modalRef = this.modalService.open(InvoiceListComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.componentInstance.subscriptionId = subscription.id;
    modalRef.componentInstance.companyName = subscription.companyName;
  }
}
