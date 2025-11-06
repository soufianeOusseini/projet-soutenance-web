import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {TicketService} from "../../../services/ticket.service";
import {Trajet} from "../../../models/trajet.model";
import {TrajetService} from "../../../services/trajet.service";
import {TicketStatus} from "../../../models/enums/ticket-status";
import {showHttpError, showSuccess} from "../../../utils/message.util";
import {TripScheduleService} from "../../../services/trip-schedule.service";
import {TripSchedule} from "../../../models/trip-schedule";
import {PrintReceiptComponent} from "../print-receipt/print-receipt.component";

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

  // Nouvelles propriétés pour la gestion des sièges
  occupiedSeats: number[] = [];
  availableSeats: number[] = [];
  nextAvailableSeat: number | null = null;
  busCapacity: number = 0;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private ticketService: TicketService,
    private trajetService: TrajetService,
    private planningService: TripScheduleService,
    private modalService: NgbModal,
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
        this.tripSchedules = data.filter(schedule => !this.isSchedulePassed(schedule));
      },
      error: error => {
        console.error('Erreur lors du chargement des trajets:', error);
      }
    });
  }

  isSchedulePassed(schedule: TripSchedule): boolean {
    const now = new Date();
    const scheduleDateTime = new Date(schedule.dateDepart!);
    const timeParts = schedule.heureDepart!.split(':');
    scheduleDateTime.setHours(parseInt(timeParts[0], 10));
    scheduleDateTime.setMinutes(parseInt(timeParts[1], 10));
    scheduleDateTime.setSeconds(timeParts[2] ? parseInt(timeParts[2], 10) : 0);
    return scheduleDateTime <= now;
  }

  isScheduleAvailable(schedule: TripSchedule): boolean {
    return !this.isSchedulePassed(schedule) && schedule.nombrePlacesDisponibles! > 0;
  }

  onTransactionTypeChange(type: string): void {
    this.selectedTransactionType = type;
    this.formGroup.patchValue({ typeTransaction: type });
    this.updateFormValidators();
  }

  updateFormValidators(): void {
    const modePaiementControl = this.formGroup.get('modePaiement');

    if (this.selectedTransactionType === 'ACHAT') {
      modePaiementControl?.setValidators([Validators.required]);
    } else {
      modePaiementControl?.clearValidators();
    }

    modePaiementControl?.updateValueAndValidity();
  }

  onTrajetChange(): void {
    const scheduleId = this.formGroup.get('scheduleId')?.value;
    if (scheduleId) {
      this.selectedSchedule = this.tripSchedules.find(s => s.id == scheduleId) || null;

      if (this.selectedSchedule) {
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

        // Récupérer la capacité du bus et charger les sièges occupés
        this.busCapacity = this.selectedSchedule.bus?.capacity || 50; // Valeur par défaut si non défini
        this.loadOccupiedSeats();
      }
    } else {
      this.selectedSchedule = null;
      this.placesRestantes = 0;
      this.occupiedSeats = [];
      this.availableSeats = [];
      this.nextAvailableSeat = null;
      this.formGroup.patchValue({
        prix: 0,
        date: '',
        heureDepart: '',
        trajetId: null,
        seatNumber: null
      });
    }
  }

  /**
   * Charge les sièges occupés depuis le backend
   */
  loadOccupiedSeats(): void {
    if (!this.selectedSchedule) return;

    this.ticketService.getOccupiedSeats(
      this.selectedSchedule.trajet.id,
      this.selectedSchedule.dateDepart!
    ).subscribe({
      next: (occupiedSeats) => {
        this.occupiedSeats = occupiedSeats;
        this.calculateAvailableSeats();
        this.setNextAvailableSeat();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des sièges occupés:', error);
      }
    });
  }

  /**
   * Calcule la liste des sièges disponibles
   */
  calculateAvailableSeats(): void {
    this.availableSeats = [];
    for (let i = 1; i <= this.busCapacity; i++) {
      if (!this.occupiedSeats.includes(i)) {
        this.availableSeats.push(i);
      }
    }
  }

  /**
   * Définit le prochain siège disponible par défaut
   */
  setNextAvailableSeat(): void {
    this.nextAvailableSeat = this.availableSeats.length > 0 ? this.availableSeats[0] : null;
    if (this.nextAvailableSeat) {
      this.formGroup.patchValue({ seatNumber: this.nextAvailableSeat });
    }
  }

  /**
   * Vérifie si un siège est disponible
   */
  isSeatAvailable(seatNumber: number): boolean {
    return this.availableSeats.includes(seatNumber);
  }

  /**
   * Gère le changement de siège sélectionné
   */
  onSeatChange(): void {
    const selectedSeat = this.formGroup.get('seatNumber')?.value;
    if (selectedSeat && !this.isSeatAvailable(selectedSeat)) {
      alert(`Le siège n°${selectedSeat} est déjà occupé. Veuillez en choisir un autre.`);
      this.setNextAvailableSeat();
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
      modePaiement: [''],
      seatNumber: [null, [Validators.required, Validators.min(1)]], // Nouveau champ

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

    if (this.isSchedulePassed(this.selectedSchedule)) {
      alert('Cette planification est déjà passée. Impossible de continuer.');
      return;
    }

    // Vérifier que le siège est toujours disponible
    const selectedSeat = this.formGroup.get('seatNumber')?.value;
    if (!this.isSeatAvailable(selectedSeat)) {
      alert(`Le siège n°${selectedSeat} n'est plus disponible. Veuillez en choisir un autre.`);
      this.loadOccupiedSeats(); // Recharger les sièges
      return;
    }

    this.isSubmitting = true;

    const formValue = { ...this.formGroup.getRawValue() };

    const ticketData: any = {
      trajetId: formValue.trajetId,
      date: formValue.date,
      heureDepart: formValue.heureDepart,
      prix: formValue.prix,
      numero: formValue.numero,
      typeTransaction: this.selectedTransactionType,
      seatNumber: formValue.seatNumber, // Nouveau champ

      clientNom: formValue.clientNom,
      clientPrenom: formValue.clientPrenom,
      clientContact: formValue.clientContact,

      modePaiement: this.selectedTransactionType === 'ACHAT' ? formValue.modePaiement : null,

      userId: null,
      reservationId: null
    };

    this.ticketService.save(ticketData).subscribe({
      next: (data) => {
        if (this.selectedTransactionType === 'ACHAT') {
          showSuccess('Ticket vendu avec succès !');

          this.activeModal.close(data);

          // Ouvrir le modal de confirmation
          const modalRef = this.modalService.open(PrintReceiptComponent, {
            size: 'md',
            centered: true,
            backdrop: 'static'
          });

          // Passer les données du ticket au modal
          modalRef.componentInstance.ticketData = {
            id: data.id,
            numero: data.numero,
            seatNumber: data.seatNumber,
            trajet: `${this.selectedSchedule?.trajet.villeDepart} → ${this.selectedSchedule?.trajet.villeArrive}`,
            prix: data.prix,
            date: data.date,
            heureDepart: data.heureDepart
          };

          // Gérer la fermeture du modal
          modalRef.result.then(
            (result) => {
              console.log('Modal fermé avec:', result);
            },
            (reason) => {
              console.log('Modal rejeté:', reason);
            }
          );
        } else {
          showSuccess('Réservation créée avec succès !');
          this.activeModal.close(data);
        }

        this.isSubmitting = false;
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

    const selectedSeat = this.formGroup.get('seatNumber')?.value;
    if (!selectedSeat || !this.isSeatAvailable(selectedSeat)) return false;

    return true;
  }

  reset(): void {
    this.formGroup.reset();
    this.selectedTransactionType = '';
    this.selectedTrajet = null;
    this.selectedSchedule = null;
    this.placesRestantes = 0;
    this.occupiedSeats = [];
    this.availableSeats = [];
    this.nextAvailableSeat = null;
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
