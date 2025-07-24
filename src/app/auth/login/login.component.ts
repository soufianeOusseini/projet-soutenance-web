import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../service/auth.service";
import {User} from "../../models/user";
import {StatusCodes} from "http-status-codes";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: false
})
export class LoginComponent implements OnInit {

  user: User = new User();
  returnUrl = '/';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.authService.logout();

    if (this.router.url.indexOf('/auth/logout') > -1) {
      window.location.href = '/';
    }
  }

  login() {
    this.loading = true;
    this.error = '';

    this.authService.login(this.user).subscribe({
      next: (tokens) => {
        console.log("Auth OK");

        // Après la connexion réussie, récupérer les informations de l'utilisateur
        this.authService.getCurrentUser().subscribe({
          next: (userData) => {
            // Vérifier si l'utilisateur doit changer son mot de passe
            if (userData && userData.passwordReseted === false) {
              // Rediriger vers la page de changement de mot de passe
              this.router.navigate(['/change-password'], {
                queryParams: { returnUrl: this.returnUrl }
              });
            } else {
              // Connexion normale - rediriger vers la page de destination
              window.location.href = this.returnUrl;
            }
            this.loading = false;
          },
          error: (userError) => {
            console.error('Erreur lors de la récupération des données utilisateur:', userError);
            // En cas d'erreur, rediriger quand même mais afficher un message
            window.location.href = this.returnUrl;
            this.loading = false;
          }
        });
      },
      error: (error) => {
        if (StatusCodes.UNAUTHORIZED == error.status) {
          this.error = 'Identifiants incorrects ou compte non activé';
        } else {
          this.error = 'Une erreur est survenue lors de la connexion';
        }
        this.loading = false;
      },
    });
  }
}
