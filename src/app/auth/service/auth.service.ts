import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import {User} from "../../models/user";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly AUTH_PATH = 'http://localhost:8080/api/v1/auth';
  jwtHelper = new JwtHelperService();

  public isConnected: WritableSignal<boolean> = signal(this.isAuthenticated());
  public username: WritableSignal<string> = signal(this.getUsername());
  public hasAdminRole: WritableSignal<boolean> = signal(this.isAdmin());

  constructor(private httpClient: HttpClient) {}

  getAuthPayload() {
    if (this.isAuthenticated()) {
      return this.jwtHelper.decodeToken(this.getToken());
    }
    return null;
  }

  public isAdmin() {
    if (this.isAuthenticated()) {
      const prv: string[] = this.jwtHelper.decodeToken(this.getToken()).prv;

      return prv.indexOf('ROLE_ADMIN') > -1;
    }
    return false;
  }

  getUsername() {
    if (this.isAuthenticated()) {
      const username: string = this.jwtHelper.decodeToken(this.getToken()).sub;

      return username;
    }
    return '';
  }

  private isAuthenticated(): boolean {
    const token = this.getToken();
    const isExpired = this.jwtHelper.isTokenExpired(token);
    return !!token && !isExpired;
  }

  getToken(): string {
    const token = localStorage.getItem('token');

    return token || '';
  }

  public checkUsernameExists(username: string): Observable<boolean> {
    return this.httpClient.get<boolean>(
      this.AUTH_PATH + '/checkusername/' + username
    );
  }

  public login(user: User): Observable<any> {
    return this.httpClient
      .post(this.AUTH_PATH + '/login', user, {
        responseType: 'text',
      })
      .pipe(
        map((data) => {
          localStorage.setItem('token', data);
          this.resetSignals();
          return data;
        })
      );
  }

  private resetSignals() {
    this.isConnected.set(this.isAuthenticated());
    this.username.set(this.getUsername());
    this.hasAdminRole.set(this.isAdmin());
  }

  public signup(user: User): Observable<User> {
    return this.httpClient.post<User>(this.AUTH_PATH + '/signup', user);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('token');
    this.resetSignals();
  }
}
