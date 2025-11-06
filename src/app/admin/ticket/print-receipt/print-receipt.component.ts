import {Component, Input} from '@angular/core';
import {showHttpError} from "../../../utils/message.util";
import {TicketService} from "../../../services/ticket.service";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-print-receipt',
  standalone: false,
  templateUrl: './print-receipt.component.html',
  styleUrl: './print-receipt.component.css'
})
export class PrintReceiptComponent {
  @Input() ticketData: any;
  isDownloading = false;
  constructor(
    public activeModal: NgbActiveModal,
    private ticketService: TicketService
  ) {}

  downloadTicketPdf(): void {
    if (!this.ticketData?.id) {
      return;
    }

    this.isDownloading = true;
    this.ticketService.downloadTicketPdf(this.ticketData?.id).subscribe({
      next: (pdfBlob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${this.ticketData?.numero}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
        setTimeout(() => {
          this.activeModal.close('downloaded');
        }, 500);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du PDF:', error);
        showHttpError(error);
        this.isDownloading = false;
      }
    });
  }
}
