import {Component, OnInit} from '@angular/core';
import {Ticket} from "../../../models/ticket.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {TicketService} from "../../../services/ticket.service";
import {ToastrService} from "ngx-toastr";
import {Trajet} from "../../../models/trajet.model";
import {TrajetService} from "../../../services/trajet.service";

@Component({
  selector: 'app-add-ticket-form',
  standalone: false,
  templateUrl: './add-ticket-form.component.html',
  styleUrl: './add-ticket-form.component.css'
})
export class AddTicketFormComponent implements OnInit {

  ticket: Ticket = new Ticket();
  trajets: Trajet[] = [];
  formGroup: FormGroup = new FormGroup({});
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private ticketService: TicketService,
    private trajetService: TrajetService,
  ) {}

  ngOnInit(): void {
    this.formGroup = this.createForm();
    this.getAllTrajets();
  }

  getAllTrajets(){
    this.trajetService.getAll().subscribe(
      data => {
        this.trajets = data;
      },
      error => {
        console.log(error);
      }
    )
  }

  createForm(): FormGroup {
    return this.fb.group(
      {
        id: [this.ticket.id],
        numero: [this.ticket.numero, [Validators.required]],
        prix: [this.ticket.prix, [Validators.required, Validators.min(0)]],
        date: [this.formatDateForInput(this.ticket.date), [Validators.required]],
        heureDepart: [this.ticket.heureDepart, [Validators.required]],
        modePaiement: [this.ticket.modePaiement, [Validators.required]],
        userId: [this.ticket.userId],
        trajetId: [this.ticket.trajetId],
      }
    );
  }

  private formatDateForInput(date: Date | undefined): string | null {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  }

  save(): void {
    if (this.formGroup.invalid) {
      // Marquer tous les champs comme touchés pour déclencher l'affichage des erreurs
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Convertir la date string en Date
    const formValue = { ...this.formGroup.value };
    if (formValue.date) {
      formValue.date = new Date(formValue.date);
    }

    this.ticketService
      .save(formValue)
      .subscribe({
        next: (data) => {
          this.isSubmitting = false;
          const message = this.ticket.id ? 'Ticket modifié avec succès' : 'Ticket créé avec succès';
          this.activeModal.close(data);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error(error);
          // On ne ferme pas le modal en cas d'erreur pour permettre à l'utilisateur de corriger
        },
      });
  }

  reset() {
    this.formGroup.reset();
    // Réinitialiser avec des valeurs par défaut si nécessaire
    this.formGroup.patchValue({
      status: 'RESERVE',
      date: new Date().toISOString().split('T')[0]
    });
  }

  close() {
    this.activeModal.dismiss('close');
  }

  // Méthodes utilitaires pour la validation des formulaires
  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Méthode pour initialiser le formulaire avec un ticket existant (pour modification)
  setTicket(ticket: Ticket) {
    this.ticket = { ...ticket };
    this.formGroup = this.createForm();
  }
}
