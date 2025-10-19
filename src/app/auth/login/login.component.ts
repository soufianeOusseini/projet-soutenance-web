import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../service/auth.service";
import {PermissionService} from "../../services/permission.service";
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
  message = '';

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.authService.logout();

    if (this.router.url.indexOf('/auth/logout') > -1) {
      window.location.href = '/';
    }
    this.route.queryParams.subscribe(params => {
      if (params['expired'] === 'true') {
        this.message = 'Votre session a expiré. Veuillez vous reconnecter.';
      }
    });
  }

  login() {
    this.loading = true;
    this.error = '';

    this.authService.login(this.user).subscribe({
      next: (tokens) => {
        this.authService.getCurrentUser().subscribe({
          next: (userData) => {
            this.permissionService.getUserPermissions().subscribe({
              next: (permissions) => {
                localStorage.setItem('roles', JSON.stringify(permissions));

                if (userData && userData.passwordReseted === false) {
                  this.router.navigate(['/change-password'], {
                    queryParams: { returnUrl: this.returnUrl }
                  });
                } else {
                  window.location.href = this.returnUrl;
                }
                this.loading = false;
              },
              error: (permError) => {
                console.error('Erreur lors de la récupération des permissions:', permError);
                window.location.href = this.returnUrl;
                this.loading = false;
              }
            });
          },
          error: (userError) => {
            console.error('Erreur lors de la récupération des données utilisateur:', userError);
            window.location.href = this.returnUrl;
            this.loading = false;
          }
        });
      },
      error: (error) => {
        if (StatusCodes.UNAUTHORIZED == error.status) {
          this.error = 'Identifiants incorrects';
        } else {
          this.error = 'Une erreur est survenue lors de la connexion';
        }
        this.loading = false;
      },
    });
  }
}
