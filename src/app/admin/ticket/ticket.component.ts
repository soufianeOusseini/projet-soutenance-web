import {Component, OnInit} from '@angular/core';
import {Ticket} from "../../models/ticket.model";
import {TicketService} from "../../services/ticket.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AddTicketFormComponent} from "./add-ticket-form/add-ticket-form.component";
import {ConfirmDeleteComponent} from "../../utils/confirm-delete/confirm-delete.component";
import {showHttpError, showSuccess} from "../../utils/message.util";
import {ConfirmReservationModalComponent} from "./confirm-reservation-modal/confirm-reservation-modal.component";
import {CancelReservationModalComponent} from "./cancel-reservation-modal/cancel-reservation-modal.component";

declare var bootstrap: any;

@Component({
  selector: 'app-ticket',
  standalone: false,
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent implements OnInit{

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  isLoading: boolean = true;
  selectedStatusFilter: string = '';
  selectedTypeFilter: string = '';
  downloadingTicketId: number | null = null;
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
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tickets:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredTickets = this.tickets.filter(ticket => {
      const statusMatch = !this.selectedStatusFilter || ticket.status === this.selectedStatusFilter;
      const typeMatch = !this.selectedTypeFilter || ticket.typeTransaction === this.selectedTypeFilter;
      return statusMatch && typeMatch;
    });
  }

  filterByStatus(event: any): void {
    this.selectedStatusFilter = event.target.value;
    this.applyFilters();
  }

  filterByType(event: any): void {
    this.selectedTypeFilter = event.target.value;
    this.applyFilters();
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

  confirmReservation(ticketId: number): void {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Ouvrir le modal de confirmation
    const modalRef = this.modalService.open(ConfirmReservationModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    // Passer les données du ticket au modal
    modalRef.componentInstance.ticketData = {
      id: ticket.id,
      numero: ticket.numero,
      clientNom: ticket.clientNom,
      clientPrenom: ticket.clientPrenom,
      clientContact: ticket.clientContact,
      seatNumber: ticket.seatNumber,
      trajet: `${ticket.trajet?.villeDepart} → ${ticket.trajet?.villeArrive}`,
      prix: ticket.prix,
      date: ticket.date,
      heureDepart: ticket.heureDepart,
      dateLimitePaiement: ticket.dateLimitePaiement
    };

    // Gérer la fermeture du modal
    modalRef.result.then(
      (result) => {
        if (result && result.success) {
          // Recharger la liste des tickets
          this.loadTickets();
        }
      },
      (reason) => {
        console.log('Modal fermé sans confirmation:', reason);
      }
    );
  }

  useTicket(ticketId: number): void {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (confirm(`Marquer ce ticket comme utilisé ?\n\nTicket: ${ticket.numero}\nClient: ${ticket.clientPrenom} ${ticket.clientNom}`)) {
      this.ticketService.useTicket(ticketId).subscribe({
        next: (data) => {
          showSuccess('Ticket marqué comme utilisé');
          this.loadTickets();
        },
        error: (error) => {
          showHttpError(error);
        }
      });
    }
  }

  confirmCancelTicket(ticket: Ticket): void {
    // Ouvrir le modal d'annulation
    const modalRef = this.modalService.open(CancelReservationModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    // Passer les données du ticket au modal
    modalRef.componentInstance.ticketData = {
      id: ticket.id,
      numero: ticket.numero,
      clientNom: ticket.clientNom,
      clientPrenom: ticket.clientPrenom,
      clientContact: ticket.clientContact,
      seatNumber: ticket.seatNumber,
      trajet: `${ticket.trajet?.villeDepart} → ${ticket.trajet?.villeArrive}`,
      date: ticket.date,
      heureDepart: ticket.heureDepart
    };

    // Gérer la fermeture du modal
    modalRef.result.then(
      (result) => {
        if (result && result.success) {
          // Recharger la liste des tickets
          this.loadTickets();
        }
      },
      (reason) => {
        console.log('Modal fermé sans annulation:', reason);
      }
    );
  }

  downloadPdf(ticket: any): void {
    this.downloadingTicketId = ticket.id;
    this.ticketService.downloadTicketPdf(ticket.id).subscribe({
      next: (pdfBlob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${ticket.numero}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.downloadingTicketId = null;
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        showHttpError(error);
        this.downloadingTicketId = null
      }
    });
  }

  // Méthodes utilitaires pour la gestion des actions selon le statut
  canEdit(ticket: Ticket): boolean {
    return ticket.status !== 'UTILISE' && ticket.status !== 'ANNULE' && !this.isTicketExpired(ticket);
  }

  canUse(ticket: Ticket): boolean {
    return ticket.status === 'PAYE' && !this.isTicketExpired(ticket);
  }

  canCancel(ticket: Ticket): boolean {
    return ticket.status !== 'UTILISE' && ticket.status !== 'ANNULE' && !this.isTicketExpired(ticket);
  }

  canDownloadPdf(ticket: Ticket): boolean {
    return ticket.status === 'PAYE' || ticket.status === 'UTILISE';
  }

  isTicketExpired(ticket: Ticket): boolean {
    if (ticket.typeTransaction !== 'RESERVATION' || !ticket.dateLimitePaiement) {
      return false;
    }
    return new Date() > new Date(ticket.dateLimitePaiement);
  }

  isReservationExpiringSoon(ticket: Ticket): boolean {
    if (ticket.typeTransaction !== 'RESERVATION' || !ticket.dateLimitePaiement || ticket.status !== 'RESERVE') {
      return false;
    }
    const now = new Date();
    const expiryDate = new Date(ticket.dateLimitePaiement);
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 2; // Expire dans moins de 2h
  }
  getStatusBadgeClass(status: string | undefined): string {
    const baseClass = 'badge';
    switch (status) {
      case 'RESERVE':
        return `${baseClass} bg-info text-white`; // Changé en bleu avec texte blanc
      case 'PAYE':
        return `${baseClass} bg-success text-white`;
      case 'ANNULE':
        return `${baseClass} bg-danger text-white`;
      case 'UTILISE':
        return `${baseClass} bg-secondary text-white`;
      case 'EXPIRE':
        return `${baseClass} bg-dark text-white`;
      default:
        return `${baseClass} bg-light text-dark`;
    }
  }

  getTypeBadgeClass(type: string | undefined): string {
    const baseClass = 'badge';
    switch (type) {
      case 'RESERVATION':
        return `${baseClass} bg-primary text-white`; // Changé en bleu primaire avec texte blanc
      case 'ACHAT':
      default:
        return `${baseClass} bg-success text-white`;
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
      case 'EXPIRE':
        return 'Expiré';
      default:
        return status || 'Inconnu';
    }
  }

  getPaymentModeText(modePaiement: string | undefined): string {
    switch (modePaiement) {
      case 'ESPECES':
        return 'Espèces';
      case 'CARTE_BANCAIRE':
        return 'Carte bancaire';
      case 'MOBILE':
        return 'Paiement mobile';
      case 'VIREMENT':
        return 'Virement';
      default:
        return modePaiement || 'Non défini';
    }
  }

  getStatistics() {
    const stats = {
      paye: 0,
      reserve: 0,
      annule: 0,
      utilise: 0,
      expire: 0,
      total: 0
    };

    this.tickets.forEach(ticket => {
      switch (ticket.status) {
        case 'PAYE':
          stats.paye++;
          stats.total += ticket.prix || 0;
          break;
        case 'RESERVE':
          stats.reserve++;
          break;
        case 'ANNULE':
          stats.annule++;
          break;
        case 'UTILISE':
          stats.utilise++;
          break;
        case 'EXPIRE':
          stats.expire++;
          break;
      }
    });

    return stats;
  }
}
