import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TicketService } from '../../../services/ticket.service';
import { showHttpError, showSuccess } from '../../../utils/message.util';

@Component({
  selector: 'app-cancel-reservation-modal',
  standalone: false,
  templateUrl: './cancel-reservation-modal.component.html',
  styleUrl: './cancel-reservation-modal.component.css'
})
export class CancelReservationModalComponent implements OnInit {

  @Input() ticketData: any;

  formGroup: FormGroup = new FormGroup({});
  isProcessing = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.createForm();
    this.setupFormListeners();
  }

  createForm(): FormGroup {
    return this.fb.group({
      motifAnnulation: ['', [Validators.required]],
      commentaire: ['']
    });
  }

  setupFormListeners(): void {
    // Ajouter la validation du commentaire quand "AUTRE" est sélectionné
    this.formGroup.get('motifAnnulation')?.valueChanges.subscribe(value => {
      const commentaireControl = this.formGroup.get('commentaire');
      if (value === 'AUTRE') {
        commentaireControl?.setValidators([Validators.required]);
      } else {
        commentaireControl?.clearValidators();
      }
      commentaireControl?.updateValueAndValidity();
    });
  }

  confirmCancellation(): void {
    if (this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isProcessing = true;

    const motifAnnulation = this.formGroup.get('motifAnnulation')?.value;
    const commentaire = this.formGroup.get('commentaire')?.value;

    this.ticketService.cancelTicket(this.ticketData.id, motifAnnulation, commentaire).subscribe({
      next: (data) => {
        showSuccess('Réservation annulée avec succès !');
        this.isProcessing = false;
        this.activeModal.close({ success: true, data });
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
