import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SubscriptionPlanFormComponent } from './subscription-plan-form/subscription-plan-form.component';
import Swal from 'sweetalert2';
import {SubscriptionPlan} from "../../../models/subscription-plan";
import {SubscriptionPlanService} from "../../../services/subscription-plan.service";

@Component({
  selector: 'app-subscription-plan',
  standalone: false,
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.css'
})
export class SubscriptionPlanComponent implements OnInit{


  plans: SubscriptionPlan[] = [];
  loading = false;

  constructor(
    private planService: SubscriptionPlanService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.planService.getAllPlans().subscribe({
      next: (data) => {
        this.plans = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plans', error);
        this.loading = false;
        Swal.fire('Erreur', 'Impossible de charger les plans', 'error');
      }
    });
  }

  add(): void {
    const modalRef = this.modalService.open(SubscriptionPlanFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadPlans();
        }
      },
      () => {}
    );
  }

  edit(plan: SubscriptionPlan): void {
    const modalRef = this.modalService.open(SubscriptionPlanFormComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.plan = plan;
    modalRef.componentInstance.isEditMode = true;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadPlans();
        }
      },
      () => {}
    );
  }

  toggleStatus(plan: SubscriptionPlan): void {
    const action = plan.active ? 'désactiver' : 'activer';

    Swal.fire({
      title: `Confirmer`,
      text: `Voulez-vous vraiment ${action} ce plan ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        const serviceCall = plan.active
          ? this.planService.deactivatePlan(plan.id!)
          : this.planService.activatePlan(plan.id!);

        serviceCall.subscribe({
          next: () => {
            Swal.fire('Succès', `Plan ${action === 'activer' ? 'activé' : 'désactivé'} avec succès`, 'success');
            this.loadPlans();
          },
          error: (error) => {
            console.error('Erreur', error);
            Swal.fire('Erreur', `Impossible de ${action} le plan`, 'error');
          }
        });
      }
    });
  }

  confirmDelete(id: number | undefined): void {
    if (!id) return;

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Cette action est irréversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Note: Vous devrez ajouter une méthode delete dans le service si nécessaire
        Swal.fire('Info', 'Fonctionnalité de suppression à implémenter', 'info');
      }
    });
  }
}
