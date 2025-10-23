import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from "@angular/router";
import { AuthService } from "../auth/service/auth.service";

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private injector: Injector // ⚡ au lieu de AuthService direct
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ⚠️ 1. Ignorer les requêtes d'authentification (login, refresh)
    if (
      request.url.includes('/login') ||
      request.url.includes('/refreshToken') ||
      request.url.includes('/signup')
    ) {
      return next.handle(request);
    }

    // ⚡ 2. Récupérer AuthService dynamiquement pour casser la boucle d'injection
    const authService = this.injector.get(AuthService);
    const token = authService.getToken();

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // 3. Gestion des erreurs
    return next.handle(request).pipe(
      tap({
        error: (err: any) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            console.warn('🔐 Token invalide ou expiré → redirection login');
            authService.logout();
            this.router.navigate(['/auth/login'], { queryParams: { expired: 'true' } });
          }
        }
      })
    );
  }
}
