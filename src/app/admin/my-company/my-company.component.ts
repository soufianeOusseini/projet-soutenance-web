import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from "../../auth/service/auth.service";
import {Router} from "@angular/router";
import {CompanieModel} from "../../models/companie.model";
import {Subject, takeUntil} from 'rxjs';

import {CompaniesService} from "../../services/companies.service";
import {FileUtility} from "../../utils/file-util";
import {Subscription} from "../../models/subscription";
import {SubscriptionService} from "../../services/subscription.service";
import Swal from "sweetalert2"; // Ajustez le chemin selon votre structure

@Component({
  selector: 'app-my-company',
  standalone: false,
  templateUrl: './my-company.component.html',
  styleUrl: './my-company.component.css'
})
export class MyCompanyComponent implements OnInit, OnDestroy{
  user: any;
  company: CompanieModel | null = null;
  formGroup: FormGroup = new FormGroup({});
  logoPath: any;
  logoFileName: any;
  FileUtility = FileUtility;
  subscription: Subscription | null = null;
  private _unsubscribeAll: Subject<any> = new Subject();
  currentUser: any

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private companyService: CompaniesService,
    private subscriptionService: SubscriptionService
  ) {
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: data => {
        this.user = data;
        this.company = this.user.company;
        this.formGroup = this.createForm();
        this.loadActiveSubscription(data);

      },
      error: err => {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
      }
    });


  }

  loadActiveSubscription(data  : any): void {
    console.log("Load Active Subscription id = " + data.company);
    this.subscriptionService.getActiveSubscriptionByCompany(data.company?.id!).subscribe({
      next: (sub) => {
        this.subscription = sub;
      },
      error: (error) => {
        console.log('Pas d\'abonnement actif pour cette compagnie');
        this.subscription = null;
      }
    });
  }

  toggleAutoRenew(event: any): void {
    const isChecked = event.target.checked;

    if (!this.subscription?.id) {
      Swal.fire('Erreur', 'Aucun abonnement actif trouvé', 'error');
      event.target.checked = false;
      return;
    }

    const action = isChecked ? 'activer' : 'désactiver';
    const title = isChecked ? '🔄 Activer le renouvellement automatique' : '⏸️ Désactiver le renouvellement automatique';
    const text = isChecked
      ? 'Votre abonnement sera automatiquement renouvelé à son expiration avec le même plan.'
      : 'Vous devrez renouveler manuellement votre abonnement avant son expiration.';

    Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isChecked ? '#28a745' : '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Oui, ${action}`,
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptionService.updateAutoRenew(this.subscription!.id!, isChecked).subscribe({
          next: () => {
            this.subscription!.autoRenew = isChecked;
            Swal.fire({
              title: 'Succès!',
              text: `Le renouvellement automatique a été ${isChecked ? 'activé' : 'désactivé'}`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour', error);
            Swal.fire('Erreur', `Impossible de ${action} le renouvellement automatique`, 'error');
            event.target.checked = !isChecked; // Remettre l'ancien état
          }
        });
      } else {
        event.target.checked = !isChecked; // Annuler le changement
      }
    });
  }



  createForm(): FormGroup {
    return this.fb.group({
      id: [this.company?.id],
      name: [this.company?.name, [Validators.required]],
      address: [this.company?.address, [Validators.required]],
      city: [this.company?.city, [Validators.required]],
      telephone: [this.company?.telephone, [Validators.required]],
      email: [this.company?.email, [Validators.email]],
      logoPath: [this.company?.logoPath],
      region: [this.company?.region, [Validators.required]],
      postalCode: [this.company?.postalCode, [Validators.required]],
      adminEmail: [this.user?.email, [Validators.required, Validators.email]],
      status: [this.company?.status],
    });
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.formGroup.patchValue({ logoPath: reader.result });
        this.logoFileName = file.name;
        this.logoPath = file;

        if (this.formGroup.value?.id) {
          this.update();
        }
      };
      reader.readAsDataURL(file);
      console.log(file);
    }
  }

  save(): void {
    const formData = new FormData();
    this.formGroup.value.logoPath = null;
    formData.append('company', JSON.stringify(this.formGroup.value));

    if (this.logoPath) {
      formData.append('logoPath', this.logoPath);
    }

    this.formGroup.disable();

    this.companyService
      .add(formData)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.logoFileName = null;
          this.getCompanyData();
          location.reload();
        },
        error: (error) => {
          console.error(error);
          this.formGroup.enable();
        },
      });
  }

  update(): void {
    const formData = new FormData();

    if (this.logoPath) {
      this.formGroup.value.logoPath = null;
      formData.append('logoPath', this.logoPath);
    }

    formData.append('company', JSON.stringify(this.formGroup.value));
    this.formGroup.disable();

    // Remplacez par votre service de compagnie
    this.companyService
      .add(formData)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.getCompanyData();
          location.reload();
        },
        error: (error) => {
          console.error(error);
          this.formGroup.enable();
        },
      });
  }


  reset(): void {
    this.formGroup.reset();
    this.logoPath = null;
    this.logoFileName = null;
  }

  private getCompanyData(): void {
    this.authService.getCurrentUser().subscribe({
      next: data => {
        this.user = data;
        this.company = this.user.company;
        this.formGroup = this.createForm();
      },
      error: err => {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
