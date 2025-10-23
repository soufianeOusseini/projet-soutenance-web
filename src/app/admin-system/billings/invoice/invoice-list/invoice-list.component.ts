import {Component, Input, OnInit} from '@angular/core';
import {Invoice} from "../../../../models/invoice";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {InvoiceService} from "../../../../services/invoice.service";
import Swal from "sweetalert2";
import {InvoiceStatus} from "../../../../models/enums/invoice-status";
import {PayInvoiceModalComponent} from "../pay-invoice-modal/pay-invoice-modal.component";

@Component({
  selector: 'app-invoice-list',
  standalone: false,
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit{


  @Input() subscriptionId?: number;
  @Input() companyName?: string;

  invoices: Invoice[] = [];
  loading = false;

  constructor(
    public activeModal: NgbActiveModal,
    private invoiceService: InvoiceService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    if (!this.subscriptionId) {
      return;
    }

    this.loading = true;
    this.invoiceService.getInvoicesBySubscription(this.subscriptionId).subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des factures', error);
        this.loading = false;
        Swal.fire('Erreur', 'Impossible de charger les factures', 'error');
      }
    });
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
          this.loadInvoices();
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
}
