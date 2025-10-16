import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {TicketService} from "../../../services/ticket.service";
import {Trajet} from "../../../models/trajet.model";
import {TrajetService} from "../../../services/trajet.service";
import {TicketStatus} from "../../../models/enums/ticket-status";
import {showHttpError, showSuccess} from "../../../utils/message.util";
import {TripScheduleService} from "../../../services/trip-schedule.service";
import {TripSchedule} from "../../../models/trip-schedule";

@Component({
  selector: 'app-add-ticket-form',
  standalone: false,
  templateUrl: './add-ticket-form.component.html',
  styleUrl: './add-ticket-form.component.css'
})
export class AddTicketFormComponent implements OnInit {

  formGroup: FormGroup = new FormGroup({});
  trajets: Trajet[] = [];
  tripSchedules: TripSchedule[] = []
  selectedTrajet: Trajet | null = null;
  placesRestantes: number | undefined ;
  isSubmitting = false;
  today: string = '';
  currentMonth: Date = new Date();
  selectedSchedule: TripSchedule | null = null;
  selectedTransactionType: string = '';

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private ticketService: TicketService,
    private trajetService: TrajetService,
    private planningService: TripScheduleService
  ) {
    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.formGroup = this.createForm();
    this.getAllTrajets();
    this.generateTicketNumber();
  }

  getAllTrajets(){
    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    this.planningService.getSchedulesByDateRange( startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]).subscribe({
      next: data => {
        // Filtrer les planifications passées
        this.tripSchedules = data.filter(schedule => !this.isSchedulePassed(schedule));
      },
      error: error => {
        console.error('Erreur lors du chargement des trajets:', error);
      }
    });
  }

  /**
   * Vérifie si une planification est déjà passée
   */
  isSchedulePassed(schedule: TripSchedule): boolean {
    const now = new Date();

    // Créer un objet Date avec la date et l'heure de départ
    const scheduleDateTime = new Date(schedule.dateDepart!);

    // Parser l'heure (format attendu: "HH:mm" ou "HH:mm:ss")
    const timeParts = schedule.heureDepart!.split(':');
    scheduleDateTime.setHours(parseInt(timeParts[0], 10));
    scheduleDateTime.setMinutes(parseInt(timeParts[1], 10));
    scheduleDateTime.setSeconds(timeParts[2] ? parseInt(timeParts[2], 10) : 0);

    // Comparer avec l'heure actuelle
    return scheduleDateTime <= now;
  }

  /**
   * Vérifie si une planification est disponible (non passée et places disponibles)
   */
  isScheduleAvailable(schedule: TripSchedule): boolean {
    return !this.isSchedulePassed(schedule) && schedule.nombrePlacesDisponibles! > 0;
  }

  onTransactionTypeChange(type: string): void {
    this.selectedTransactionType = type;
    this.formGroup.patchValue({ typeTransaction: type });

    // Réinitialiser les validateurs selon le type
    this.updateFormValidators();
  }

  updateFormValidators(): void {
    const modePaiementControl = this.formGroup.get('modePaiement');

    if (this.selectedTransactionType === 'ACHAT') {
      // Pour les achats, le mode de paiement est obligatoire
      modePaiementControl?.setValidators([Validators.required]);
    } else {
      // Pour les réservations, pas de mode de paiement requis
      modePaiementControl?.clearValidators();
    }

    modePaiementControl?.updateValueAndValidity();
  }

  onTrajetChange(): void {
    const scheduleId = this.formGroup.get('scheduleId')?.value;
    if (scheduleId) {
      this.selectedSchedule = this.tripSchedules.find(s => s.id == scheduleId) || null;

      if (this.selectedSchedule) {
        // Vérifier si la planification est passée
        if (this.isSchedulePassed(this.selectedSchedule)) {
          alert('Cette planification est déjà passée. Veuillez en sélectionner une autre.');
          this.formGroup.patchValue({ scheduleId: '' });
          this.selectedSchedule = null;
          this.placesRestantes = 0;
          return;
        }

        this.formGroup.patchValue({
          prix: this.selectedSchedule.prix,
          date: this.selectedSchedule.dateDepart,
          heureDepart: this.selectedSchedule.heureDepart,
          trajetId: this.selectedSchedule.trajet.id
        });

        this.placesRestantes = this.selectedSchedule.nombrePlacesDisponibles;
      }
    } else {
      this.selectedSchedule = null;
      this.placesRestantes = 0;
      this.formGroup.patchValue({
        prix: 0,
        date: '',
        heureDepart: '',
        trajetId: null
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      scheduleId: ['', [Validators.required]],
      trajetId: [''],
      date: [''],
      typeTransaction: [''],

      clientNom: ['', [Validators.required, Validators.minLength(2)]],
      clientPrenom: ['', [Validators.required, Validators.minLength(2)]],
      clientContact: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{8,15}$/)]],

      numero: [''],
      prix: [{ value: 0, disabled: true }],
      modePaiement: [''], // Validateurs ajoutés dynamiquement

      status: [''],
      heureDepart: [{ value: '', disabled: true }]
    });
  }

  generateTicketNumber(): void {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const ticketNumber = `TK${timestamp.slice(-6)}${random}`;
    this.formGroup.patchValue({ numero: ticketNumber });
  }

  save(): void {
    if (this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    if (!this.selectedSchedule || this.selectedSchedule?.nombrePlacesDisponibles! <= 0) {
      return;
    }

    // Vérification finale avant la soumission
    if (this.isSchedulePassed(this.selectedSchedule)) {
      alert('Cette planification est déjà passée. Impossible de continuer.');
      return;
    }

    this.isSubmitting = true;

    // Récupérer les valeurs en incluant les champs disabled
    const formValue = { ...this.formGroup.getRawValue() };

    // Créer l'objet TicketDTO
    const ticketData: any = {
      trajetId: formValue.trajetId,
      date: formValue.date,
      heureDepart: formValue.heureDepart,
      prix: formValue.prix,
      numero: formValue.numero,
      typeTransaction: this.selectedTransactionType,

      // Informations client
      clientNom: formValue.clientNom,
      clientPrenom: formValue.clientPrenom,
      clientContact: formValue.clientContact,

      // Paiement (seulement pour les achats)
      modePaiement: this.selectedTransactionType === 'ACHAT' ? formValue.modePaiement : null,

      // Autres champs
      userId: null,
      reservationId: null
    };

    this.ticketService.save(ticketData).subscribe({
      next: (data) => {
        if (this.selectedTransactionType === 'ACHAT') {
          showSuccess('Ticket vendu avec succès !');

          if (confirm('Voulez-vous télécharger le reçu PDF maintenant ?')) {
            this.downloadTicketPdf(data.id!);
          }
        } else {
          showSuccess('Réservation créée avec succès !');
        }

        this.isSubmitting = false;
        this.activeModal.close(data);
      },
      error: (error) => {
        showHttpError(error);
        this.isSubmitting = false;
        console.error('Erreur lors de la transaction:', error);
      }
    });
  }

  downloadTicketPdf(ticketId: number): void {
    this.ticketService.downloadTicketPdf(ticketId).subscribe({
      next: (pdfBlob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${ticketId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du PDF:', error);
        showHttpError(error);
      }
    });
  }

  canSubmit(): boolean {
    if (!this.selectedTransactionType) return false;
    if (this.isSubmitting) return false;
    if (this.formGroup.invalid) return false;
    if (!this.selectedSchedule) return false;
    if (this.selectedSchedule.nombrePlacesDisponibles! <= 0) return false;
    if (this.isSchedulePassed(this.selectedSchedule)) return false;

    return true;
  }

  reset(): void {
    this.formGroup.reset();
    this.selectedTransactionType = '';
    this.selectedTrajet = null;
    this.selectedSchedule = null;
    this.placesRestantes = 0;
    this.generateTicketNumber();
    this.updateFormValidators();
  }

  close(): void {
    this.activeModal.dismiss('close');
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getPlacesRestantesBadgeClass(): string {
    if (this.placesRestantes! > 10) return 'bg-success';
    if (this.placesRestantes! > 3) return 'bg-warning';
    return 'bg-danger';
  }
}
