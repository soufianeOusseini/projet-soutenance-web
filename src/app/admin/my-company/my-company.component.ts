import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from "../../auth/service/auth.service";
import {Router} from "@angular/router";
import {CompanieModel} from "../../models/companie.model";
import {Subject, takeUntil} from 'rxjs';

import {CompaniesService} from "../../services/companies.service";
import {FileUtility} from "../../utils/file-util"; // Ajustez le chemin selon votre structure

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
  private _unsubscribeAll: Subject<any> = new Subject();

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private companyService: CompaniesService,
  ) {
  }

  ngOnInit(): void {
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

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.company?.id],
      name: [this.company?.name, [Validators.required]],
      address: [this.company?.address, [Validators.required]],
      city: [this.company?.city, [Validators.required]],
      telephone: [this.company?.telephone, [Validators.required]],
      email: [this.company?.email, [Validators.email]],
      logoPath: [this.company?.logoPath],
      // Ajoutez d'autres champs selon votre modèle CompanieModel
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

        // Si la compagnie existe déjà, on met à jour automatiquement
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
}
