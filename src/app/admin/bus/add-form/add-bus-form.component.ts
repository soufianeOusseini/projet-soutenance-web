import {Component, OnInit} from '@angular/core';
import {Bus} from "../../../models/bus.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {BusService} from "../../../services/bus.service";
import {BusStatus} from "../../../models/enums/bus-status";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-add-form',
  standalone: false,
  templateUrl: './add-bus-form.component.html',
  styleUrl: './add-bus-form.component.css'
})
export class AddBusFormComponent implements OnInit {

  bus: Bus = new Bus();
  formGroup: FormGroup = new FormGroup({});
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private busService: BusService,
  ) {}

  ngOnInit(): void {
    this.formGroup = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group(
      {
        id: [this.bus.id],
        plaque: [this.bus.plaque, [Validators.required]],
        model: [this.bus.model, [Validators.required]],
        capacity: [this.bus.capacity, [Validators.required]],
        number: [this.bus.number, [Validators.required]],
        image: [''],
        type: [this.bus.type, [Validators.required]],
        status: [this.bus.status],
        spaceAvailable: [this.bus.spaceAvailable],
      }
    );
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

    this.busService
      .save(this.formGroup.value)
      .subscribe({
        next: (data) => {
          this.isSubmitting = false;
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
    // Réinitialiser les valeurs par défaut pour status et spaceAvailable
    this.formGroup.patchValue({
      status: BusStatus.AVAILABLE,
      spaceAvailable: 0
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
}
