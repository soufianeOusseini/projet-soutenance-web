import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from "@angular/router";
import { AuthService } from "../auth/service/auth.service";

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;

  constructor(
    private router: Router,
    private injector: Injector
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Ignorer les requêtes d'authentification (login, refresh, signup)
    if (
      request.url.includes('/login') ||
      request.url.includes('/refreshToken') ||
      request.url.includes('/signup')
    ) {
      return next.handle(request);
    }

    // 2. Récupérer AuthService dynamiquement
    const authService = this.injector.get(AuthService);
    const token = authService.getToken();

    // 3. Ajouter le token si disponible
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // 4. Gestion des erreurs avec distinction
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Vérifier si c'est une erreur d'authentification (token invalide/expiré)
          // vs une erreur d'autorisation (accès refusé à une ressource)
          const errorMessage = error.error?.message || error.message || '';

          // Si le message indique un problème de token ou d'authentification
          if (
            errorMessage.toLowerCase().includes('token') ||
            errorMessage.toLowerCase().includes('expired') ||
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('authentication') ||
            error.error?.error === 'invalid_token' ||
            error.error?.error === 'token_expired'
          ) {
            console.warn('🔐 Token invalide ou expiré → tentative de refresh');

            // Tenter de rafraîchir le token
            if (!this.isRefreshing && authService.getRefreshToken()) {
              this.isRefreshing = true;

              return authService.refreshToken().pipe(
                switchMap(() => {
                  this.isRefreshing = false;
                  // Réessayer la requête avec le nouveau token
                  const newToken = authService.getToken();
                  const clonedRequest = request.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`,
                    },
                  });
                  return next.handle(clonedRequest);
                }),
                catchError((refreshError) => {
                  this.isRefreshing = false;
                  // Si le refresh échoue, alors déconnecter
                  console.error('❌ Refresh token échoué → déconnexion');
                  authService.logout();
                  this.router.navigate(['/auth/login'], {
                    queryParams: { expired: 'true' }
                  });
                  return throwError(() => refreshError);
                })
              );
            } else {
              // Pas de refresh token disponible → déconnecter
              console.warn('🔐 Pas de refresh token → déconnexion');
              authService.logout();
              this.router.navigate(['/auth/login'], {
                queryParams: { expired: 'true' }
              });
            }
          } else {
            // C'est une erreur d'autorisation (accès refusé), pas d'authentification
            // On laisse l'erreur remonter pour que le composant la gère
            console.warn('⚠️ Erreur 401 - Accès refusé (pas un problème de token)');
          }
        }

        // Propager l'erreur pour que les composants puissent la gérer
        return throwError(() => error);
      })
    );
  }
}
