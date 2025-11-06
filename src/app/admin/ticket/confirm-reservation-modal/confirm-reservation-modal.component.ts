import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TicketService } from '../../../services/ticket.service';
import { showHttpError, showSuccess } from '../../../utils/message.util';
import {PrintReceiptComponent} from "../print-receipt/print-receipt.component";

@Component({
  selector: 'app-confirm-reservation-modal',
  standalone: false,
  templateUrl: './confirm-reservation-modal.component.html',
  styleUrl: './confirm-reservation-modal.component.css'
})
export class ConfirmReservationModalComponent implements OnInit{

  @Input() ticketData: any;

  formGroup: FormGroup = new FormGroup({});
  isProcessing = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private ticketService: TicketService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.formGroup = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      modePaiement: ['', [Validators.required]]
    });
  }

  confirmPayment(): void {
    if (this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isProcessing = true;
    const modePaiement = this.formGroup.get('modePaiement')?.value;

    this.ticketService.confirmReservation(this.ticketData.id, modePaiement).subscribe({
      next: (data) => {
        showSuccess('Réservation confirmée avec succès !');
        this.isProcessing = false;

        // Fermer ce modal
        this.activeModal.close({ success: true, data });

        // Ouvrir le modal de succès avec option de téléchargement
        const modalRef = this.modalService.open(PrintReceiptComponent, {
          size: 'md',
          centered: true,
          backdrop: 'static'
        });

        // Passer les données du ticket au modal
        modalRef.componentInstance.ticketData = {
          id: data.id,
          numero: data.numero,
          seatNumber: data.seatNumber || this.ticketData.seatNumber,
          trajet: this.ticketData.trajet,
          prix: data.prix,
          date: data.date,
          heureDepart: data.heureDepart
        };
      },
      error: (error) => {
        showHttpError(error);
        this.isProcessing = false;
      }
    });
  }

  canConfirm(): boolean {
    return this.formGroup.valid && !this.isProcessing;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
