import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import Swal from 'sweetalert2';
import {SubscriptionPlan} from "../../../../models/subscription-plan";
import {CompanieModel} from "../../../../models/companie.model";
import {SubscriptionService} from "../../../../services/subscription.service";
import {SubscriptionPlanService} from "../../../../services/subscription-plan.service";
import {CompaniesService} from "../../../../services/companies.service";

@Component({
  selector: 'app-subscription-form',
  standalone: false,
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.css']
})
export class SubscriptionFormComponent implements OnInit {
  formGroup!: FormGroup;
  loading = false;
  plans: SubscriptionPlan[] = [];
  companies: CompanieModel[] = [];
  selectedPlan?: SubscriptionPlan;
  hasActiveSubscription = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService,
    private planService: SubscriptionPlanService,
    private companyService: CompaniesService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPlans();
    this.loadCompanies();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    this.formGroup = this.fb.group({
      companyId: [null, [Validators.required]],
      planId: [null, [Validators.required]],
      startDate: [today, [Validators.required]],
      autoRenew: [false]
    });
  }

  loadPlans(): void {
    this.planService.getActivePlans().subscribe({
      next: (data) => {
        this.plans = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plans', error);
        Swal.fire('Erreur', 'Impossible de charger les plans', 'error');
      }
    });
  }

  loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (data) => {
        this.companies = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des compagnies', error);
        Swal.fire('Erreur', 'Impossible de charger les compagnies', 'error');
      }
    });
  }

  onCompanyChange(): void {
    const companyId = this.formGroup.get('companyId')?.value;

    if (companyId) {
      // Vérifier si la compagnie a déjà un abonnement actif
      this.subscriptionService.getActiveSubscriptionByCompany(companyId).subscribe({
        next: (subscription) => {
          if (subscription) {
            this.hasActiveSubscription = true;
            Swal.fire({
              title: 'Attention',
              text: 'Cette compagnie possède déjà un abonnement actif',
              icon: 'warning'
            });
          }
        },
        error: () => {
          // Pas d'abonnement actif (erreur 404 attendue)
          this.hasActiveSubscription = false;
        }
      });
    }
  }

  onPlanChange(): void {
    const planId = this.formGroup.get('planId')?.value;
    this.selectedPlan = this.plans.find(p => p.id === +planId);
  }

  calculateEndDate(): Date | null {
    const startDate = this.formGroup.get('startDate')?.value;

    if (!startDate || !this.selectedPlan) {
      return null;
    }

    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + this.selectedPlan.durationInDays!);

    return endDate;
  }

  reset(): void {
    const today = new Date().toISOString().split('T')[0];
    this.formGroup.reset({
      startDate: today,
      autoRenew: false
    });
    this.selectedPlan = undefined;
    this.hasActiveSubscription = false;
  }

  save(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    if (this.hasActiveSubscription) {
      Swal.fire('Erreur', 'Cette compagnie possède déjà un abonnement actif', 'error');
      return;
    }

    this.loading = true;
    const formValue = this.formGroup.value;

    this.subscriptionService.createSubscription(formValue).subscribe({
      next: () => {
        Swal.fire(
          'Succès',
          'Abonnement créé avec succès. Une facture a été générée automatiquement.',
          'success'
        );
        this.loading = false;
        this.activeModal.close(true);
      },
      error: (error) => {
        console.error('Erreur', error);
        Swal.fire(
          'Erreur',
          error.error?.message || 'Impossible de créer l\'abonnement',
          'error'
        );
        this.loading = false;
      }
    });
  }
}
