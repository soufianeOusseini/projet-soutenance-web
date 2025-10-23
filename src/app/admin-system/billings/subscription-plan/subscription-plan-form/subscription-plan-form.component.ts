import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import Swal from 'sweetalert2';
import {SubscriptionPlanService} from "../../../../services/subscription-plan.service";
import {SubscriptionPlan} from "../../../../models/subscription-plan";

@Component({
  selector: 'app-subscription-plan-form',
  standalone: false,
  templateUrl: './subscription-plan-form.component.html',
  styleUrls: ['./subscription-plan-form.component.css']
})
export class SubscriptionPlanFormComponent implements OnInit {
  @Input() plan?: SubscriptionPlan;
  @Input() isEditMode = false;

  formGroup!: FormGroup;
  loading = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private planService: SubscriptionPlanService
  ) {}

  ngOnInit(): void {
    this.initForm();

    if (this.isEditMode && this.plan) {
      this.formGroup.patchValue(this.plan);
    }
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      name: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      durationInDays: [30, [Validators.required, Validators.min(1)]],
      description: ['']
    });
  }

  reset(): void {
    this.formGroup.reset({
      price: 0,
      durationInDays: 30
    });
  }

  save(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.formGroup.value;

    const observable = this.isEditMode && this.plan?.id
      ? this.planService.updatePlan(this.plan.id, formValue)
      : this.planService.createPlan(formValue);

    observable.subscribe({
      next: () => {
        Swal.fire(
          'Succès',
          `Plan ${this.isEditMode ? 'modifié' : 'créé'} avec succès`,
          'success'
        );
        this.loading = false;
        this.activeModal.close(true);
      },
      error: (error) => {
        console.error('Erreur', error);
        Swal.fire(
          'Erreur',
          error.error?.message || `Impossible de ${this.isEditMode ? 'modifier' : 'créer'} le plan`,
          'error'
        );
        this.loading = false;
      }
    });
  }
}
