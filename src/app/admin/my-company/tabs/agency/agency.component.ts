import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CompanieModel } from "../../../../models/companie.model";
import { AgencyService } from "../../../../services/agency.service";
import {AgencyModel} from "../../../../models/agency";

@Component({
  selector: 'app-agency',
  standalone: false,
  templateUrl: './agency.component.html',
  styleUrl: './agency.component.css'
})
export class AgencyComponent implements OnInit, OnDestroy {
  @Input() company: CompanieModel | null = null;
  @Input() user: any;
  @Input() formGroup!: FormGroup;

  agencies: AgencyModel[] = [];
  showAddForm = false;
  editingAgency: AgencyModel | null = null;
  agencyForm: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private agencyService: AgencyService
  ) {
    this.agencyForm = this.createAgencyForm();
  }

  ngOnInit(): void {
    this.loadAgencies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createAgencyForm(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      address: [''],
      telephone: ['', [Validators.required]],
      city: ['', [Validators.required]],
      region: [''],
      email: ['', [Validators.email]],
      managerName: [''],
      managerPhone: [''],
      status: ['ACTIVE']
    });
  }

  loadAgencies(): void {
    if (!this.company?.id) return;

    this.loading = true;
    this.agencyService.getAgenciesByCompany(this.company.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (agencies) => {
          this.agencies = agencies;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des agences:', error);
          this.loading = false;
        }
      });
  }

  showAddAgencyForm(): void {
    this.showAddForm = true;
    this.editingAgency = null;
    this.agencyForm.reset();
    this.agencyForm.patchValue({ status: 'ACTIVE' });
  }

  editAgency(agency: AgencyModel): void {
    this.editingAgency = agency;
    this.showAddForm = true;
    this.agencyForm.patchValue(agency);
  }

  saveAgency(): void {
    if (this.agencyForm.valid && this.company?.id) {
      const agencyData = { ...this.agencyForm.value, companyId: this.company.id };
      this.loading = true;

      const saveOperation = this.editingAgency
        ? this.agencyService.updateAgency(this.editingAgency.id!, agencyData)
        : this.agencyService.createAgency(agencyData);

      saveOperation
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.cancelAgencyForm();
            this.loadAgencies();
            this.loading = false;
          },
          error: (error) => {
            console.error('Erreur lors de la sauvegarde:', error);
            this.loading = false;
          }
        });
    }
  }

  deleteAgency(agency: AgencyModel): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'agence "${agency.name}" ?`) && agency.id) {
      this.loading = true;
      this.agencyService.deleteAgency(agency.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadAgencies();
            this.loading = false;
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.loading = false;
          }
        });
    }
  }

  cancelAgencyForm(): void {
    this.showAddForm = false;
    this.editingAgency = null;
    this.agencyForm.reset();
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'SUSPENDED': 'Suspendu',
      'PENDING': 'En attente'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'ACTIVE': 'success',
      'INACTIVE': 'secondary',
      'SUSPENDED': 'warning',
      'PENDING': 'info'
    };
    return classMap[status] || 'secondary';
  }
}
