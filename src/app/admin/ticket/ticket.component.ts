import {Component, OnInit} from '@angular/core';
import {Ticket} from "../../models/ticket.model";
import {TicketService} from "../../services/ticket.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AddTicketFormComponent} from "./add-ticket-form/add-ticket-form.component";
import {ConfirmDeleteComponent} from "../../utils/confirm-delete/confirm-delete.component";
import {showHttpError, showSuccess} from "../../utils/message.util";
declare var bootstrap: any;

@Component({
  selector: 'app-ticket',
  standalone: false,
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent implements OnInit{

  tickets: Ticket[] = [];
  isLoading: boolean = true;

  constructor(
    private ticketService: TicketService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.ticketService.getAll().subscribe({
      next: (data) => {
        this.tickets = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tickets:', error);
        this.isLoading = false;
      }
    });
  }

  add(): void {
    const modalRef = this.modalService.open(AddTicketFormComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadTickets();
        }
      },
      (dismissed) => {
      }
    );
  }

  edit(ticket: Ticket): void {
    const modalRef = this.modalService.open(AddTicketFormComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.setTicket(ticket);

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadTickets();
        }
      },
      (dismissed) => {
      }
    );
  }

  delete(value: any): void {
    this.ticketService
      .delete(value)
      .subscribe({
        next: (data) => {
          showSuccess()
          this.loadTickets()
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
    const baseClass = 'badge';
    switch (status) {
      case 'RESERVE':
        return `${baseClass} bg-warning`;
      case 'PAYE':
        return `${baseClass} bg-success`;
      case 'ANNULE':
        return `${baseClass} bg-danger`;
      case 'UTILISE':
        return `${baseClass} bg-secondary`;
      default:
        return `${baseClass} bg-light text-dark`;
    }
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'RESERVE':
        return 'Réservé';
      case 'PAYE':
        return 'Payé';
      case 'ANNULE':
        return 'Annulé';
      case 'UTILISE':
        return 'Utilisé';
      default:
        return status || 'Inconnu';
    }
  }

  getPaymentModeText(modePaiement: string | undefined): string {
    switch (modePaiement) {
      case 'ESPECES':
        return 'Espèces';
      case 'CARTE':
        return 'Carte bancaire';
      case 'MOBILE':
        return 'Paiement mobile';
      case 'VIREMENT':
        return 'Virement';
      default:
        return modePaiement || 'Inconnu';
    }
  }
}
