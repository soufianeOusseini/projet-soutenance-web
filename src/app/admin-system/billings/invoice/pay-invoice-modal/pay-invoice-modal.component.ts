import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import Swal from 'sweetalert2';
import {Invoice} from "../../../../models/invoice";
import {InvoiceService} from "../../../../services/invoice.service";

@Component({
  selector: 'app-pay-invoice-modal',
  standalone: false,
  templateUrl: './pay-invoice-modal.component.html',
  styleUrls: ['./pay-invoice-modal.component.css']
})
export class PayInvoiceModalComponent implements OnInit {
  @Input() invoice?: Invoice;

  formGroup!: FormGroup;
  loading = false;
  maxDate: string;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private invoiceService: InvoiceService
  ) {
    // Date maximale = aujourd'hui
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.formGroup = this.fb.group({
      paymentMethod: ['', [Validators.required]],
      paymentDate: [today, [Validators.required]]
    });
  }

  save(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    if (!this.invoice?.id) {
      Swal.fire('Erreur', 'Facture invalide', 'error');
      return;
    }

    this.loading = true;
    const formValue = this.formGroup.value;

    this.invoiceService.payInvoice(this.invoice.id, formValue).subscribe({
      next: () => {
        Swal.fire(
          'Succès',
          'Paiement enregistré avec succès',
          'success'
        );
        this.loading = false;
        this.activeModal.close(true);
      },
      error: (error) => {
        console.error('Erreur', error);
        Swal.fire(
          'Erreur',
          error.error?.message || 'Impossible d\'enregistrer le paiement',
          'error'
        );
        this.loading = false;
      }
    });
  }
}
