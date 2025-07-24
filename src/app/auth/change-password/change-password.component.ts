import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../service/auth.service";
import {StatusCodes} from "http-status-codes";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
  standalone: false
})
export class ChangePasswordComponent implements OnInit {

  newPassword = '';
  confirmPassword = '';
  returnUrl = '/';
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Récupérer l'URL de retour
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  changePassword() {
    this.error = '';
    this.success = '';


    if (this.newPassword !== this.confirmPassword) {
      this.error = 'La confirmation du mot de passe ne correspond pas';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.loading = true;

    const passwordData = {
      password: this.newPassword
    };

    this.authService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.success = 'Mot de passe modifié avec succès';
        this.loading = false;

        // Rediriger après 2 secondes
        setTimeout(() => {
          window.location.href = this.returnUrl;
        }, 2000);
      },
      error: (error) => {
        this.loading = false;

        if (error.status === StatusCodes.UNAUTHORIZED) {
          this.error = 'Mot de passe actuel incorrect';
        } else if (error.status === StatusCodes.BAD_REQUEST) {
          this.error = 'Données invalides';
        } else {
          this.error = 'Une erreur est survenue lors du changement de mot de passe';
        }
      }
    });
  }

  cancelChange() {
    // Déconnecter l'utilisateur s'il annule le changement obligatoire
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
