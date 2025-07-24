import {Component, Input, OnInit} from '@angular/core';
import {CompanieModel} from "../../../../models/companie.model";

@Component({
  selector: 'app-accounts',
  standalone: false,
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent implements OnInit {
  @Input() company: CompanieModel | null = null;
  @Input() user: any;

  constructor() { }

  ngOnInit(): void {
    // Pour l'instant, ce composant reste vide
    // Vous pourrez ajouter ici les fonctionnalités de gestion de compte
    console.log('Company Account Component initialized');
  }
}
