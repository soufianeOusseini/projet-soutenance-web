import { Injectable, WritableSignal, signal } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { map, catchError, switchMap, tap, finalize } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from "../../models/user";
import { Router } from '@angular/router';
import {Role} from "../../models/role.model";

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

  private currentUserRolesSubject: BehaviorSubject<Role[]> = new BehaviorSubject<Role[]>([]);
  public currentUserRoles$: Observable<Role[]> = this.currentUserRolesSubject.asObservable();

  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  public isConnected: WritableSignal<boolean> = signal(false);
  public username: WritableSignal<string> = signal('');
  public hasAdminRole: WritableSignal<boolean> = signal(false);

  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private tokenExpirationTimer: any;
  private userLoadedFromStorage = false;

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initialisation SANS appel HTTP pour éviter la dépendance circulaire
   */
  private initializeAuth(): void {
    console.log('🔄 Initialisation AuthService...');

    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    // Pas de token du tout
    if (!token) {
      console.log('ℹ️ Aucun token trouvé');
      this.initializeSignals();
      return;
    }

    // Vérifier la validité du token
    const isExpired = this.isTokenExpired(token);

    if (isExpired) {
      console.warn('⚠️ Token expiré détecté');

      // Si on a un refresh token, on va juste setup les signaux
      // Le refresh se fera lors du premier appel HTTP via l'interceptor
      if (refreshToken) {
        console.log('ℹ️ Refresh token disponible - sera utilisé lors du prochain appel');
        this.initializeSignals();
        this.loadRolesFromStorage(); // Charger seulement depuis localStorage
      } else {
        console.warn('⚠️ Pas de refresh token disponible');
        this.cleanupInvalidSession();
      }
    } else {
      // Token valide
      console.log('✅ Token valide trouvé');
      this.initializeSignals();
      this.setupTokenExpirationTimer();
      this.loadRolesFromStorage(); // Charger seulement depuis localStorage
    }
  }

  /**
   * Charge les rôles uniquement depuis localStorage (pas d'appel HTTP)
   * Évite la dépendance circulaire au démarrage
   */
  private loadRolesFromStorage(): void {
    try {
      const rolesStr = localStorage.getItem('roles');
      if (rolesStr) {
        const roleNames = JSON.parse(rolesStr);
        // Créer des objets Role simplifiés depuis les noms
        const roles: Role[] = roleNames.map((name: string) => ({ name } as Role));
        this.currentUserRolesSubject.next(roles);
        console.log('✅ Rôles chargés depuis localStorage:', roleNames);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des rôles:', error);
    }
  }

  /**
   * Méthode publique pour charger l'utilisateur complet
   * À appeler depuis un composant après l'initialisation
   */
  public ensureUserLoaded(): Observable<User> {
    // Si déjà chargé, retourner l'utilisateur actuel
    if (this.userLoadedFromStorage && this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }

    // Sinon charger depuis l'API
    if (this.isAuthenticated()) {
      return this.getCurrentUser().pipe(
        tap((user) => {
          this.currentUserSubject.next(user);
          this.currentUserRolesSubject.next(user.roles || []);
          this.userLoadedFromStorage = true;

          console.log('✅ Utilisateur chargé:', {
            username: user.username,
            roles: user.roles?.map(r => r.name)
          });
        }),
        catchError((error) => {
          console.error('❌ Erreur lors du chargement de l\'utilisateur:', error);
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => error);
        })
      );
    }

    return throwError(() => new Error('Non authentifié'));
  }

  /**
   * Vérifie si le token est expiré avec une marge de sécurité
   */
  private isTokenExpired(token: string): boolean {
    try {
      const expirationDate = this.jwtHelper.getTokenExpirationDate(token);

      if (!expirationDate) {
        console.warn('⚠️ Impossible de récupérer la date d\'expiration');
        return true;
      }

      const now = new Date();
      // Ajouter une marge de 5 minutes (300000 ms)
      const expirationWithMargin = new Date(expirationDate.getTime() - 300000);

      const isExpired = now >= expirationWithMargin;

      console.log('🕐 Vérification expiration:', {
        now: now.toISOString(),
        expiration: expirationDate.toISOString(),
        expirationWithMargin: expirationWithMargin.toISOString(),
        isExpired
      });

      return isExpired;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification d\'expiration:', error);
      return true;
    }
  }

  private cleanupInvalidSession(): void {
    console.log('🧹 Nettoyage de la session invalide');
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    this.currentUserSubject.next(null);
    this.currentUserRolesSubject.next([]);
    this.userLoadedFromStorage = false;
    this.initializeSignals();
  }

  private initializeSignals(): void {
    try {
      const authenticated = this.isAuthenticated();
      this.isConnected.set(authenticated);
      this.username.set(authenticated ? this.getUsername() : '');
      this.hasAdminRole.set(authenticated ? this.isAdmin() : false);

      console.log('📊 Signaux initialisés:', {
        isConnected: authenticated,
        username: this.username(),
        hasAdminRole: this.hasAdminRole()
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des signaux:', error);
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

  public isAdmin(): boolean {
    const userPermissions = this.getUserPermissions();
    return userPermissions.includes('ROLE_ADMIN') || userPermissions.includes('ROLE_SUPER_ADMIN');
  }

  public isAdminCompany(): boolean {
    const userPermissions = this.getUserPermissions();
    return userPermissions.includes('ROLE_COMPANY_ADMIN') || userPermissions.includes('ROLE_SUPER_ADMIN');
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

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token || token.split('.').length !== 3) {
      return false;
    }

    // Utiliser notre méthode avec marge
    return !this.isTokenExpired(token);
  }

  getToken(): string | null {
    const tokenObject = localStorage.getItem('token');
    if (tokenObject) {
      try {
        const parsed = JSON.parse(tokenObject);
        return parsed.accessToken || null;
      } catch (e) {
        console.error('❌ Erreur de parsing du token :', e);
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
        console.error('❌ Erreur de parsing du refresh token :', e);
        return null;
      }
    }
    return null;
  }

  private setupTokenExpirationTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const token = this.getToken();
    if (token) {
      try {
        const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
        if (expirationDate) {
          const now = new Date().getTime();
          const timeUntilExpiry = expirationDate.getTime() - now;

          // Rafraîchir 5 minutes avant l'expiration
          const refreshTime = Math.max(timeUntilExpiry - 300000, 0);

          console.log('⏰ Timer configuré:', {
            expiresIn: Math.round(timeUntilExpiry / 1000 / 60) + ' minutes',
            refreshIn: Math.round(refreshTime / 1000 / 60) + ' minutes'
          });

          this.tokenExpirationTimer = setTimeout(() => {
            console.log('⏰ Tentative de refresh automatique...');

            if (this.isAuthenticated()) {
              this.refreshToken().subscribe({
                next: () => console.log('✅ Token rafraîchi automatiquement'),
                error: () => {
                  console.error('❌ Échec du refresh automatique');
                  this.handleSessionExpired();
                }
              });
            } else {
              this.handleSessionExpired();
            }
          }, refreshTime);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la configuration du timer:', error);
      }
    }
  }

  public refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      console.error('❌ Refresh token non disponible');
      return throwError(() => new Error('Refresh token non disponible'));
    }

    if (this.refreshTokenInProgress) {
      console.log('⏳ Refresh déjà en cours, attente...');
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

    console.log('🔄 Début du refresh token...');
    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    return this.httpClient.post<TokenResponse>(
      `${this.AUTH_PATH}/refreshToken`,
      { refreshToken },
      { responseType: 'json' }
    ).pipe(
      tap((tokens: TokenResponse) => {
        console.log('✅ Nouveaux tokens reçus');
        localStorage.setItem('token', JSON.stringify(tokens));
        this.resetSignals();
        this.setupTokenExpirationTimer();
        this.refreshTokenSubject.next(tokens);
      }),
      catchError((error) => {
        console.error('❌ Erreur lors du refresh:', error);
        this.handleSessionExpired();
        return throwError(() => error);
      }),
      finalize(() => {
        console.log('🏁 Refresh terminé');
        this.refreshTokenInProgress = false;
      })
    );
  }

  private handleSessionExpired(): void {
    console.warn('⚠️ Session expirée - déconnexion');
    this.logout();
    this.router.navigate(['/auth/login'], {
      queryParams: { expired: 'true' }
    });
  }

  public checkUsernameExists(username: string): Observable<boolean> {
    return this.httpClient.get<boolean>(
      this.AUTH_PATH + '/checkusername/' + username
    );
  }

  public login(user: User): Observable<any> {
    console.log('🔐 Tentative de connexion...');

    return this.httpClient
      .post<TokenResponse>(this.AUTH_PATH + '/login', user)
      .pipe(
        tap((tokens) => {
          console.log('✅ Tokens reçus');
          localStorage.setItem('token', JSON.stringify(tokens));
        }),
        switchMap(() => {
          return this.getCurrentUser();
        }),
        tap((currentUser) => {
          this.currentUserSubject.next(currentUser);
          this.currentUserRolesSubject.next(currentUser.roles || []);
          this.userLoadedFromStorage = true;

          const roleNames = currentUser.roles?.map(r => r.name) || [];
          localStorage.setItem('roles', JSON.stringify(roleNames));

          console.log('✅ Connexion réussie:', {
            username: currentUser.username,
            roles: roleNames
          });

          this.resetSignals();
          this.setupTokenExpirationTimer();
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Erreur de connexion:', error);
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
    console.log('👋 Déconnexion...');

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('roles');

    this.currentUserSubject.next(null);
    this.currentUserRolesSubject.next([]);
    this.userLoadedFromStorage = false;

    this.resetSignals();
  }

  getCurrentUser(): Observable<User> {
    return this.httpClient.get<User>(`${this.AUTH_PATH}/current-user`);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  changePassword(passwordData: { password: string }): Observable<any> {
    return this.httpClient.post(`${this.AUTH_PATH}/reset-password`, passwordData, {
      headers: this.getAuthHeaders()
    });
  }

  hasPermission(permission?: string): boolean {
    if (!permission) {
      return true;
    }

    if (this.isAdmin()) {
      return true;
    }

    if(this.isAdminCompany()){
      return true;
    }

    const userPermissions = this.getUserPermissions();
    return userPermissions.includes(permission);
  }

  getUserPermissions(): string[] {
    const roles = localStorage.getItem('roles');
    if (roles) {
      try {
        return JSON.parse(roles);
      } catch (e) {
        console.error('❌ Erreur de parsing des permissions:', e);
        return [];
      }
    }
    return [];
  }

  getUserRoles(): Observable<Role[]> {
    return this.currentUserRoles$;
  }

  getCurrentUserRoles(): Role[] {
    return this.currentUserRolesSubject.value;
  }

  hasRole(roleName: string): boolean {
    const roles = this.currentUserRolesSubject.value;
    return roles.some(role => role.name === roleName);
  }

  hasAnyRole(roleNames: string[]): boolean {
    const roles = this.currentUserRolesSubject.value;
    return roles.some(role => roleNames.includes(role.name!));
  }
}
