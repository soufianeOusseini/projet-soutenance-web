import {Component, OnInit} from '@angular/core';
import {Colis} from "../../../models/colis.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Trajet} from "../../../models/trajet.model";
import {TrajetService} from "../../../services/trajet.service";

@Component({
  selector: 'app-add-form',
  standalone: false,
  templateUrl: './add-trajet-form.component.html',
  styleUrl: './add-trajet-form.component.css'
})
export class AddTrajetFormComponent implements OnInit{
  trajet: Trajet = new Trajet();
  formGroup: FormGroup = new FormGroup({});
  isEditMode: boolean = false;

  constructor(private fb: FormBuilder, public activeModal: NgbActiveModal, private trajetService: TrajetService) {
  }

  ngOnInit(): void {
    this.formGroup = this.createForm();
    // Détecter si on est en mode édition
    this.isEditMode = !!this.trajet.id;
  }

  createForm(): FormGroup{
    return this.fb.group(
      {
        id: [this.trajet.id],
        nom: [this.trajet.nom, [Validators.required]],
        villeDepart: [this.trajet.villeDepart, [Validators.required]],
        villeArrive: [this.trajet.villeArrive, [Validators.required]],
        km: [this.trajet.km, [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)]],
        amount: [this.trajet.amount, [Validators.required]],
      }
    )
  }

  save(): void {
    if (this.formGroup.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.trajetService
      .save(this.formGroup.value)
      .subscribe({
        next: (data) => {
          this.activeModal.close('saved');
        },
        error: (error) => {
          console.error(error);
          this.activeModal.close('error');
        },
      });
  }

  update(): void {
    if (this.formGroup.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.trajetService
      .save(this.formGroup.value)
      .subscribe({
        next: (data) => {
          this.activeModal.close('updated');
        },
        error: (error) => {
          console.error(error);
          this.activeModal.close('error');
        },
      });
  }

  reset() {
    this.formGroup.reset();
  }

  close() {
    this.activeModal.close('closed');
  }

  // Getters pour faciliter la vérification des erreurs dans le template
  get nom() { return this.formGroup.get('nom'); }
  get villeDepart() { return this.formGroup.get('villeDepart'); }
  get villeArrive() { return this.formGroup.get('villeArrive'); }
  get km() { return this.formGroup.get('km'); }
  get amount() { return this.formGroup.get('amount'); }
}
