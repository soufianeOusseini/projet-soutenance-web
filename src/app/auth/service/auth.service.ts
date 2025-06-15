import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { map, catchError, switchMap, tap, finalize } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from "../../models/user";
import { Router } from '@angular/router';
import {Colis} from "../../models/colis.model";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly AUTH_PATH = 'http://localhost:8080/api/authentication';
  jwtHelper = new JwtHelperService();

  // Signaux pour la réactivité
  public isConnected: WritableSignal<boolean> = signal(false);
  public username: WritableSignal<string> = signal('');
  public hasAdminRole: WritableSignal<boolean> = signal(false);

  // Pour la gestion du refresh token
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private tokenExpirationTimer: any;

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) {
    // Initialiser les signaux après la construction
    this.initializeSignals();
    // Configurer le timer d'expiration si un token est présent
    this.setupTokenExpirationTimer();
  }

  private initializeSignals(): void {
    // Initialiser les signaux en toute sécurité
    try {
      this.isConnected.set(this.isAuthenticated());
      this.username.set(this.getUsername());
      this.hasAdminRole.set(this.isAdmin());
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des signaux:', error);
      // En cas d'erreur, s'assurer que les signaux ont des valeurs valides
      this.isConnected.set(false);
      this.username.set('');
      this.hasAdminRole.set(false);
    }
  }

  getAuthPayload() {
    if (this.isAuthenticated()) {
      const token = this.getToken();
      if (token) {
        return this.jwtHelper.decodeToken(token);
      }
    }
    return null;
  }

  public isAdmin() {
    if (this.isAuthenticated()) {
      const token = this.getToken();
      if (token) {
        const payload = this.jwtHelper.decodeToken(token);
        if (payload && payload.prv) {
          return payload.prv.indexOf('ROLE_ADMIN') > -1;
        }
      }
    }
    return false;
  }

  getUsername() {
    if (this.isAuthenticated()) {
      const token = this.getToken();
      if (token) {
        const payload = this.jwtHelper.decodeToken(token);
        return payload.sub || '';
      }
    }
    return '';
  }

  private isAuthenticated(): boolean {
    const token = this.getToken();
    // Vérifier si le token existe et a un format JWT valide
    if (!token || token.split('.').length !== 3) {
      return false;
    }
    return !this.jwtHelper.isTokenExpired(token);
  }

  getToken(): string | null {
    const tokenObject = localStorage.getItem('token');
    if (tokenObject) {
      try {
        const parsed = JSON.parse(tokenObject);
        return parsed.accessToken || null;
      } catch (e) {
        console.error('Erreur de parsing du token :', e);
        return null;
      }
    }
    return null;
  }

  getRefreshToken(): string | null {
    const tokenObject = localStorage.getItem('token');
    if (tokenObject) {
      try {
        const parsed = JSON.parse(tokenObject);
        return parsed.refreshToken || null;
      } catch (e) {
        console.error('Erreur de parsing du refresh token :', e);
        return null;
      }
    }
    return null;
  }

  // Configuration du timer d'expiration
  private setupTokenExpirationTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const token = this.getToken();
    if (token) {
      try {
        const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
        if (expirationDate) {
          const timeUntilExpiry = expirationDate.getTime() - new Date().getTime();
          // Déclencher le refresh 30 secondes avant l'expiration
          const refreshTime = Math.max(timeUntilExpiry - 30000, 0);

          this.tokenExpirationTimer = setTimeout(() => {
            // Si le token est encore valide, tenter de le rafraîchir
            if (this.isAuthenticated()) {
              this.refreshToken().subscribe({
                next: () => console.log('Token rafraîchi avec succès'),
                error: () => this.handleSessionExpired()
              });
            } else {
              this.handleSessionExpired();
            }
          }, refreshTime);
        }
      } catch (error) {
        console.error('Erreur lors de la configuration du timer d\'expiration:', error);
      }
    }
  }

  // Refresh token lorsque le token d'accès expire
  public refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('Refresh token non disponible'));
    }

    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.pipe(
        switchMap(token => {
          if (token) {
            return of(token);
          } else {
            return throwError(() => new Error('Échec du rafraîchissement du token'));
          }
        })
      );
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    return this.httpClient.post<TokenResponse>(
      `${this.AUTH_PATH}/refreshToken`,
      { refreshToken },
      { responseType: 'json' }
    ).pipe(
      tap((tokens: TokenResponse) => {
        localStorage.setItem('token', JSON.stringify(tokens));
        this.resetSignals();
        this.setupTokenExpirationTimer();
        this.refreshTokenSubject.next(tokens);
      }),
      catchError((error) => {
        console.error('Erreur lors du rafraîchissement du token:', error);
        this.handleSessionExpired();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshTokenInProgress = false;
      })
    );
  }

  // Gérer l'expiration de la session
  private handleSessionExpired(): void {
    this.logout();
    // Rediriger vers la page de login
    this.router.navigate(['/login'], {
      queryParams: { expired: 'true' }
    });
  }

  public checkUsernameExists(username: string): Observable<boolean> {
    return this.httpClient.get<boolean>(
      this.AUTH_PATH + '/checkusername/' + username
    );
  }

  public login(user: User): Observable<any> {
    return this.httpClient
      .post<TokenResponse>(this.AUTH_PATH + '/login', user)
      .pipe(
        map((tokens) => {
          localStorage.setItem('token', JSON.stringify(tokens));
          this.resetSignals();
          this.setupTokenExpirationTimer();
          return tokens;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Erreur de connexion:', error);
          return throwError(() => error);
        })
      );
  }

  private resetSignals() {
    this.initializeSignals();
  }

  public signup(user: User): Observable<User> {
    return this.httpClient.post<User>(this.AUTH_PATH + '/signup', user);
  }

  logout() {
    // Annuler le timer d'expiration
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }

    // Supprimer le token du stockage local
    localStorage.removeItem('token');
    this.resetSignals();
  }

  getCurrentUser(): Observable<User> {
    return this.httpClient.get<User>(`${this.AUTH_PATH}/current-user`);
  }
}
