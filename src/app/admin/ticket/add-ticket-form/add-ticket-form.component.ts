import {Component, OnInit} from '@angular/core';
import {Ticket} from "../../../models/ticket.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {TicketService} from "../../../services/ticket.service";
import {ToastrService} from "ngx-toastr";
import {Trajet} from "../../../models/trajet.model";
import {TrajetService} from "../../../services/trajet.service";
import {TicketStatus} from "../../../models/enums/ticket-status";

@Component({
  selector: 'app-add-ticket-form',
  standalone: false,
  templateUrl: './add-ticket-form.component.html',
  styleUrl: './add-ticket-form.component.css'
})
export class AddTicketFormComponent implements OnInit {

  formGroup: FormGroup = new FormGroup({});
  trajets: Trajet[] = [];
  selectedTrajet: Trajet | null = null;
  placesRestantes: number = 3;
  isSubmitting = false;
  today: string = '';

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private ticketService: TicketService,
    private trajetService: TrajetService,
  ) {
    // Définir la date d'aujourd'hui pour la validation
    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.formGroup = this.createForm();
    this.getAllTrajets();
    this.generateTicketNumber();
  }

  getAllTrajets(){
    this.trajetService.getAll().subscribe({
      next: data => {
        this.trajets = data;
      },
      error: error => {
        console.error('Erreur lors du chargement des trajets:', error);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Informations du trajet
      trajetId: ['', [Validators.required]],
      date: [this.today, [Validators.required]],

      // Informations client
      clientNom: ['', [Validators.required, Validators.minLength(2)]],
      clientPrenom: ['', [Validators.required, Validators.minLength(2)]],
      clientContact: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{8,15}$/)]],

      // Informations ticket
      numero: [''],
      prix: [0],
      modePaiement: ['', [Validators.required]],

      // Champs cachés
      status: [TicketStatus.PAYE], // Status automatiquement défini à PAYÉ
      heureDepart: ['']
    });
  }

  onTrajetChange(): void {
    const trajetId = this.formGroup.get('trajetId')?.value;
    if (trajetId) {
      this.selectedTrajet = this.trajets.find(t => t.id == trajetId) || null;
      if (this.selectedTrajet) {
        // Mettre à jour le prix et l'heure
        this.formGroup.patchValue({
          prix: this.selectedTrajet.amount,
          heureDepart: this.selectedTrajet.heure
        });

        // Calculer les places restantes
        this.calculatePlacesRestantes();
      }
    } else {
      this.selectedTrajet = null;
      this.placesRestantes = 0;
      this.formGroup.patchValue({
        prix: 0,
        heureDepart: ''
      });
    }
  }

  calculatePlacesRestantes(): void {
    if (!this.selectedTrajet) {
      this.placesRestantes = 0;
      return;
    }

    const date = this.formGroup.get('date')?.value;
    if (!date) {
      this.placesRestantes = 0;
      return;
    }

    // Appeler le service pour obtenir le nombre de places restantes
    // this.ticketService.getPlacesRestantes(this.selectedTrajet.id, date).subscribe({
    //   next: (places) => {
    //     this.placesRestantes = places;
    //   },
    //   error: (error) => {
    //     console.error('Erreur lors du calcul des places:', error);
    //     this.placesRestantes = 0;
    //   }
    // });
  }

  generateTicketNumber(): void {
    // Générer un numéro de ticket unique
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const ticketNumber = `TK${timestamp.slice(-6)}${random}`;
    this.formGroup.patchValue({ numero: ticketNumber });
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

    if (this.placesRestantes <= 0) {
      return;
    }

    this.isSubmitting = true;

    // Préparer les données pour l'envoi
    const formValue = { ...this.formGroup.value };

    // Convertir la date string en Date
    if (formValue.date) {
      formValue.date = new Date(formValue.date);
    }

    // Ajouter les informations client comme métadonnées (ou créer un client temporaire)
    const ticketData = {
      ...formValue,
      clientInfo: {
        nom: formValue.clientNom,
        prenom: formValue.clientPrenom,
        contact: formValue.clientContact
      }
    };

    this.ticketService.save(ticketData).subscribe({
      next: (data) => {
        this.isSubmitting = false;

        // Proposer l'impression du ticket
        if (confirm('Voulez-vous imprimer le ticket maintenant ?')) {
          this.imprimerTicket(data);
        }

        this.activeModal.close(data);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Erreur lors de la vente:', error);
      }
    });
  }

  imprimerTicket(ticket: any): void {
    // Logique d'impression du ticket
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const ticketHtml = this.generateTicketHtml(ticket);
      printWindow.document.write(ticketHtml);
      printWindow.document.close();
      printWindow.print();
    }
  }

  generateTicketHtml(ticket: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket de Transport</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; }
          .ticket { border: 2px solid #000; padding: 15px; text-align: center; }
          .header { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .info { margin: 5px 0; }
          .barcode { font-family: 'Courier New', monospace; font-size: 12px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">TICKET DE TRANSPORT</div>
          <div class="info"><strong>N°:</strong> ${ticket.numero}</div>
          <div class="info"><strong>Client:</strong> ${ticket.clientInfo?.prenom} ${ticket.clientInfo?.nom}</div>
          <div class="info"><strong>Contact:</strong> ${ticket.clientInfo?.contact}</div>
          <div class="info"><strong>Trajet:</strong> ${this.selectedTrajet?.villeDepart} → ${this.selectedTrajet?.villeArrive}</div>
          <div class="info"><strong>Date:</strong> ${new Date(ticket.date).toLocaleDateString()}</div>
          <div class="info"><strong>Heure:</strong> ${ticket.heureDepart}</div>
          <div class="info"><strong>Prix:</strong> ${ticket.prix} XOF</div>
          <div class="info"><strong>Statut:</strong> PAYÉ</div>
          <div class="barcode">${ticket.numero}</div>
          <div style="font-size: 10px; margin-top: 10px;">
            Merci pour votre voyage !<br>
            Conservez ce ticket jusqu'à destination
          </div>
        </div>
      </body>
      </html>
    `;
  }

  reset(): void {
    this.formGroup.reset();
    this.formGroup.patchValue({
      date: this.today,
      status: 'PAYE',
      prix: 0
    });
    this.selectedTrajet = null;
    this.placesRestantes = 0;
    this.generateTicketNumber();
  }

  close(): void {
    this.activeModal.dismiss('close');
  }

  // Méthodes utilitaires
  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getPlacesRestantesBadgeClass(): string {
    if (this.placesRestantes > 10) return 'bg-success';
    if (this.placesRestantes > 3) return 'bg-warning';
    return 'bg-danger';
  }
}
