import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    return this.authService.getUserRoles().pipe(
      take(1),
      map(roles => {
        const requiredRoles = route.data['roles'] as Array<string>;

        if (!requiredRoles || requiredRoles.length === 0) {
          return true;
        }

        const hasRole = roles.some(role =>
          requiredRoles.includes(role.name!)
        );

        if (!hasRole) {
          this.router.navigate(['/']);
          return false;
        }

        return true;
      })
    );
  }
}
