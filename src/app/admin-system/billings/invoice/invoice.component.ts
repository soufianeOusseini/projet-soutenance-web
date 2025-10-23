import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PayInvoiceModalComponent } from './pay-invoice-modal/pay-invoice-modal.component';
import Swal from 'sweetalert2';
import {CompanieModel} from "../../../models/companie.model";
import {Invoice} from "../../../models/invoice";
import {InvoiceService} from "../../../services/invoice.service";
import {CompaniesService} from "../../../services/companies.service";
import {InvoiceStatus} from "../../../models/enums/invoice-status";

@Component({
  selector: 'app-invoice',
  standalone: false,
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  companies: CompanieModel[] = [];
  selectedCompanyId: number | null = null;
  filterStatus = 'all';
  loading = false;

  stats = {
    pending: 0,
    pendingAmount: 0,
    paid: 0,
    paidAmount: 0,
    overdue: 0,
    overdueAmount: 0,
    total: 0,
    totalAmount: 0
  };

  constructor(
    private invoiceService: InvoiceService,
    private companyService: CompaniesService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadAllInvoices();
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

  loadAllInvoices(): void {
    this.loading = true;
    this.invoiceService.getAllInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.calculateStats();
        this.filterInvoices();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des factures', error);
        this.loading = false;
        Swal.fire('Erreur', 'Impossible de charger les factures', 'error');
      }
    });
  }

  loadOverdueInvoices(): void {
    this.loading = true;
    this.invoiceService.getOverdueInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.filterStatus = 'OVERDUE';
        this.calculateStats();
        this.filterInvoices();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur', error);
        this.loading = false;
        Swal.fire('Erreur', 'Impossible de charger les factures en retard', 'error');
      }
    });
  }

  filterInvoices(): void {
    let filtered = [...this.invoices];

    // Filtrer par compagnie
    if (this.selectedCompanyId) {
      filtered = filtered.filter(i => i.companyId === this.selectedCompanyId);
    }

    // Filtrer par statut
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(i => i.status === this.filterStatus);
    }

    console.log("Filtered " + filtered);

    this.filteredInvoices = filtered;
  }

  calculateStats(): void {
    this.stats = {
      pending: 0,
      pendingAmount: 0,
      paid: 0,
      paidAmount: 0,
      overdue: 0,
      overdueAmount: 0,
      total: this.invoices.length,
      totalAmount: 0
    };

    this.invoices.forEach(invoice => {
      this.stats.totalAmount += invoice.amount!;

      switch (invoice.status) {
        case InvoiceStatus.PENDING:
          if (this.isOverdue(invoice)) {
            this.stats.overdue++;
            this.stats.overdueAmount += invoice.amount!;
          } else {
            this.stats.pending++;
            this.stats.pendingAmount += invoice.amount!;
          }
          break;
        case InvoiceStatus.PAID:
          this.stats.paid++;
          this.stats.paidAmount += invoice.amount!;
          break;
        case InvoiceStatus.OVERDUE:
          this.stats.overdue++;
          this.stats.overdueAmount += invoice.amount!;
          break;
      }
    });
  }

  isOverdue(invoice: Invoice): boolean {
    if (invoice.status !== InvoiceStatus.PENDING) {
      return false;
    }
    const dueDate = new Date(invoice.dueDate!);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  getDueDateClass(invoice: Invoice): string {
    if (invoice.status === InvoiceStatus.PAID) {
      return '';
    }

    const dueDate = new Date(invoice.dueDate!);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'text-danger fw-bold';
    } else if (diffDays <= 7) {
      return 'text-warning fw-bold';
    }
    return '';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case InvoiceStatus.PENDING:
        return 'bg-warning';
      case InvoiceStatus.PAID:
        return 'bg-success';
      case InvoiceStatus.OVERDUE:
        return 'bg-danger';
      case InvoiceStatus.CANCELLED:
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case InvoiceStatus.PENDING:
        return 'En attente';
      case InvoiceStatus.PAID:
        return 'Payée';
      case InvoiceStatus.OVERDUE:
        return 'En retard';
      case InvoiceStatus.CANCELLED:
        return 'Annulée';
      default:
        return status;
    }
  }

  pay(invoice: Invoice): void {
    const modalRef = this.modalService.open(PayInvoiceModalComponent, {
      size: 'md',
      backdrop: 'static'
    });

    modalRef.componentInstance.invoice = invoice;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadAllInvoices();
        }
      },
      () => {}
    );
  }

  viewDetails(invoice: Invoice): void {
    Swal.fire({
      title: `Facture ${invoice.invoiceNumber}`,
      html: `
        <div class="text-start">
          <p><strong>Compagnie:</strong> ${invoice.companyName}</p>
          <p><strong>Montant:</strong> ${invoice.amount!.toLocaleString()} FCFA</p>
          <p><strong>Date émission:</strong> ${new Date(invoice.issueDate!).toLocaleDateString('fr-FR')}</p>
          <p><strong>Date échéance:</strong> ${new Date(invoice.dueDate!).toLocaleDateString('fr-FR')}</p>
          ${invoice.paymentDate ? `<p><strong>Date paiement:</strong> ${new Date(invoice.paymentDate).toLocaleDateString('fr-FR')}</p>` : ''}
          ${invoice.paymentMethod ? `<p><strong>Méthode paiement:</strong> ${invoice.paymentMethod}</p>` : ''}
          <p><strong>Statut:</strong> <span class="badge ${this.getStatusBadgeClass(invoice.status!)}">${this.getStatusLabel(invoice.status!)}</span></p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Fermer'
    });
  }

  downloadInvoice(invoice: Invoice): void {
    // TODO: Implémenter la génération et le téléchargement du PDF
    Swal.fire('Info', 'Fonctionnalité de téléchargement à implémenter', 'info');
  }

  cancel(invoice: Invoice): void {
    Swal.fire({
      title: 'Annuler la facture',
      text: `Êtes-vous sûr de vouloir annuler la facture ${invoice.invoiceNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.invoiceService.cancelInvoice(invoice.id!).subscribe({
          next: () => {
            Swal.fire('Succès', 'Facture annulée avec succès', 'success');
            this.loadAllInvoices();
          },
          error: (error) => {
            console.error('Erreur', error);
            Swal.fire('Erreur', 'Impossible d\'annuler la facture', 'error');
          }
        });
      }
    });
  }
}
