import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Permission} from "../models/permission";


@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = "http://localhost:8080/api/permission";

  constructor(private http: HttpClient) { }

  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/all`);
  }

  addPermissionToRole(roleId: number, permissionName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/add/${roleId}/${permissionName}`, {});
  }

  removePermissionFromRole(roleId: number, permissionName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/delete/${roleId}/${permissionName}`, {});
  }

  addPermissionsToRole(roleId: number, permissionNames: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/add-multiple/${roleId}/${permissionNames.join(',')}`, {});
  }

  removePermissionsFromRole(roleId: number, permissionNames: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/delete-multiple/${roleId}/${permissionNames.join(',')}`, {});
  }

  getUserPermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/user-permissions`);
  }
}
