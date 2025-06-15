import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Colis } from "../../../models/colis.model";
import { ColisService } from "../../../services/colis.service";
import {ColisItems} from "../../../models/colis-items";

@Component({
  selector: 'app-add-colis-form',
  templateUrl: './add-colis-form.component.html',
  standalone: false,
  styleUrls: ['./add-colis-form.component.css']
})
export class AddColisFormComponent implements OnInit {
  now = new Date();
  colis: Colis = new Colis();
  formGroup: FormGroup = new FormGroup({});
  statusOptions: string[] = ['EN_ATTENTE', 'EN_TRANSIT', 'LIVRE', 'ANNULE'];
  formSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private colisService: ColisService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.createForm();

    // Ajouter au moins un colisItem par défaut si c'est une nouvelle création et qu'il n'existe pas encore d'items
    if (!this.colis.colisItems || this.colis.colisItems.length === 0) {
      this.addColisItem();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.colis.id],
      numero: [this.colis.numero],
      expediteur: [this.colis.expediteur, Validators.required],
      destinateur: [this.colis.destinateur, Validators.required],
      heureEnvoi: [this.colis.heureEnvoi || this.now.toISOString().substring(11, 19)],
      prix: [this.colis.prix, [Validators.required, Validators.min(0)]],
      lieuEnvoi: [this.colis.lieuEnvoi, Validators.required],
      lieuReception: [this.colis.lieuReception, Validators.required],
      status: [this.colis.status,Validators.required],
      colisItems: this.fb.array(this.initColisItems())
    });
  }

  get colisItemsArray() {
    return this.formGroup.get('colisItems') as FormArray;
  }

  initColisItems(): FormGroup[] {
    const items: FormGroup[] = [];

    if (this.colis.colisItems && this.colis.colisItems.length > 0) {
      this.colis.colisItems.forEach(item => {
        items.push(this.createColisItemFormGroup(item));
      });
    }

    return items;
  }

  createColisItemFormGroup(item?: ColisItems): FormGroup {
    return this.fb.group({
      id: [item?.id || null],
      description: [item?.description || '', Validators.required],
      nombre: [item?.nombre || 1, [Validators.required, Validators.min(1)]],
      nature: [item?.nature || '', Validators.required]
    });
  }

  addColisItem(): void {
    this.colisItemsArray.push(this.createColisItemFormGroup());
  }

  removeColisItem(index: number): void {
    if (this.colisItemsArray.length > 1) {
      this.colisItemsArray.removeAt(index);
    } else {
      alert('Le colis doit avoir au moins un article');
    }
  }

  save(): void {
    this.formSubmitted = true;

    if (this.formGroup.invalid || this.colisItemsArray.length === 0) {
      this.markFormGroupTouched(this.formGroup);
      return;
    }

    const formData = this.formGroup.value;

    // Si c'est une création, générer un numéro unique
    if (!formData.id) {
      formData.numero = this.generateUniqueNumber();
    }

    this.colisService.save(formData)
      .subscribe({
        next: (data) => {
          this.activeModal.close(data);
        },
        error: (error) => {
          console.error(error);
          alert('Erreur lors de l\'enregistrement: ' + (error.message || 'Une erreur est survenue'));
        },
      });
  }

  generateUniqueNumber(): string {
    // Génération d'un numéro unique basé sur la date
    const date = new Date();
    return 'COL-' + date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  }

  reset(): void {
    // Réinitialiser les colisItems
    while (this.colisItemsArray.length) {
      this.colisItemsArray.removeAt(0);
    }

    // Réinitialisation du formulaire
    if (this.colis.id) {
      // Mode édition: Revenir à l'état initial
      this.formGroup.patchValue({
        id: this.colis.id,
        numero: this.colis.numero,
        expediteur: this.colis.expediteur,
        destinateur: this.colis.destinateur,
        heureEnvoi: this.colis.heureEnvoi,
        prix: this.colis.prix,
        lieuEnvoi: this.colis.lieuEnvoi,
        lieuReception: this.colis.lieuReception,
        status: this.colis.status || 'EN_ATTENTE'
      });

      // Reconstruire les items
      if (this.colis.colisItems && this.colis.colisItems.length > 0) {
        this.colis.colisItems.forEach(item => {
          this.colisItemsArray.push(this.createColisItemFormGroup(item));
        });
      } else {
        this.addColisItem();
      }
    } else {
      // Mode création: Tout effacer
      this.formGroup.reset({
        status: 'EN_ATTENTE'
      });
      this.addColisItem();
    }

    this.formSubmitted = false;
  }

  close(): void {
    this.activeModal.close();
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs de validation
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(item => {
          if (item instanceof FormGroup) {
            this.markFormGroupTouched(item);
          }
        });
      }
    });
  }
}
