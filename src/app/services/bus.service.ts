import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Bus} from "../models/bus.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BusService {

  url = "http://localhost:8080/api/bus";
  constructor(private http: HttpClient) { }


  save(data: Bus | FormData): Observable<any> {
    if (data instanceof FormData) {
      // Pour les données avec fichier (FormData)
      return this.http.post<Bus>(`${this.url}`, data);
    } else {
      // Pour les données JSON simples
      return this.http.post<Bus>(`${this.url}`, data);
    }
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${(this.url)}/all`,)
  }


  getById(id: number): Observable<Bus> {
    return this.http.get<Bus>(`${this.url}/${id}`);
  }


  updateStatus(id: number, status: string): Observable<Bus> {
    return this.http.patch<Bus>(`${this.url}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/delete/${id}`);
  }
}
