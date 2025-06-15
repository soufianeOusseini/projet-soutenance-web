import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Role} from "../models/role.model";
import {User} from "../models/user";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = "http://localhost:8080/api/user";

  constructor(private http: HttpClient) { }

  getAll(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, user);
  }

  updateUser(user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Méthodes supplémentaires qui pourraient être utiles

  resetPassword(userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/reset-password`, {});
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }
}
