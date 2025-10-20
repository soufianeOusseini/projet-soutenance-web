import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from "../auth/service/auth.service";

@Injectable({
  providedIn: 'root'
})
export class RoleBasedRedirectGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    return this.authService.getUserRoles().pipe(
      take(1),
      map(roles => {

        if (!roles || roles.length === 0) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        const roleNames = roles.map(role => role.name);

        if (roleNames.includes('ROLE_SUPER_ADMIN')) {
          this.router.navigate(['/admin-system']);
          return false;
        } else if (roleNames.includes('ROLE_COMPANY_ADMIN') || roleNames.includes('ROLE_ADMIN')) {
          this.router.navigate(['/admin']);
          return false;
        }

        this.router.navigate(['/auth/login']);
        return false;
      })
    );
  }
}
