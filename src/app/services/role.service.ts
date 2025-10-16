import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Role} from "../models/role";

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = "http://localhost:8080/api/role";

  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<any[]>(`${this.apiUrl}/company`);
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}`, role);
  }

  updateRole(role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/update`, role);
  }
  deleteRole(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
