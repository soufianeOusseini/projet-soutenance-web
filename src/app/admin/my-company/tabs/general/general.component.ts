import {Component, Input, OnInit} from '@angular/core';
import {CompanieModel} from "../../../../models/companie.model";

@Component({
  selector: 'app-general',
  standalone: false,
  templateUrl: './general.component.html',
  styleUrl: './general.component.css'
})
export class GeneralComponent implements OnInit {

  @Input() company: CompanieModel | null = null;
  @Input() user: any;

  editMode = false;
  editedCompany: CompanieModel = new CompanieModel();

  constructor() { }

  ngOnInit(): void {
    if (this.company) {
      // Copier les données de la compagnie pour l'édition
      this.editedCompany = { ...this.company };
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode && this.company) {
      this.editedCompany = { ...this.company };
    }
  }

  saveChanges(): void {
    // Ici vous ajouterez la logique de sauvegarde
    console.log('Sauvegarde des modifications:', this.editedCompany);
    // Après la sauvegarde réussie:
    // this.company = { ...this.editedCompany };
    // this.editMode = false;
  }

  cancelEdit(): void {
    this.editMode = false;
    if (this.company) {
      this.editedCompany = { ...this.company };
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'INACTIVE': return 'Inactif';
      case 'PENDING': return 'En attente';
      case 'SUSPENDED': return 'Suspendu';
      default: return 'Non défini';
    }
  }
}
