import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Profile} from "../models/profile.model";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  url = "http://localhost:8080/api/profile";

  constructor(private http: HttpClient) { }

  getAllProfiles(): Observable<Profile[]> {
    return this.http.get<any[]>(`${this.url}`);
  }

  getProfileById(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.url}/${id}`);
  }
}
