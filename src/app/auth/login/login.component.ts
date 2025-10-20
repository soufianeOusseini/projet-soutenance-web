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

    // La méthode login() mise à jour charge automatiquement l'utilisateur et ses rôles
    this.authService.login(this.user).subscribe({
      next: (userData) => {
        console.log('✅ Login réussi, utilisateur:', userData);

        // Récupérer les permissions
        this.permissionService.getUserPermissions().subscribe({
          next: (permissions) => {
            console.log('🔐 Permissions récupérées:', permissions);
            localStorage.setItem('roles', JSON.stringify(permissions));

            // Vérifier si le mot de passe doit être réinitialisé
            if (userData && userData.passwordReseted === false) {
              this.router.navigate(['/change-password'], {
                queryParams: { returnUrl: this.returnUrl }
              });
            } else {
              // Rediriger selon le rôle
              this.redirectBasedOnRole();
            }
            this.loading = false;
          },
          error: (permError) => {
            console.error('❌ Erreur lors de la récupération des permissions:', permError);
            // Rediriger quand même selon le rôle
            this.redirectBasedOnRole();
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('❌ Erreur de connexion:', error);

        if (StatusCodes.UNAUTHORIZED == error.status) {
          this.error = 'Identifiants incorrects';
        } else {
          this.error = 'Une erreur est survenue lors de la connexion';
        }
        this.loading = false;
      },
    });
  }

  /**
   * Redirige l'utilisateur selon son rôle
   */
  private redirectBasedOnRole(): void {
    const roles = this.authService.getCurrentUserRoles();
    const roleNames = roles.map(r => r.name);

    console.log('🔍 Redirection basée sur les rôles:', roleNames);

    if (roleNames.includes('ROLE_SUPER_ADMIN')) {
      console.log('➡️ Redirection vers /admin-system');
      this.router.navigate(['/admin-system']);
    } else if (roleNames.includes('ROLE_ADMIN') || roleNames.includes('ROLE_COMPANY_ADMIN')) {
      console.log('➡️ Redirection vers /admin');
      this.router.navigate(['/admin']);
    } else {
      console.log('➡️ Redirection par défaut vers', this.returnUrl);
      this.router.navigate([this.returnUrl]);
    }
  }
}
