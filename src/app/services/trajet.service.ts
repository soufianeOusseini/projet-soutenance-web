import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Ticket} from "../models/ticket.model";
import {Observable} from "rxjs";
import {Trajet} from "../models/trajet.model";
import {Bus} from "../models/bus.model";

@Injectable({
  providedIn: 'root'
})
export class TrajetService {

  url = "http://localhost:8080/api/trajet";
  constructor(private http: HttpClient) { }


  save(trajet: Trajet): Observable<Trajet> {
    return this.http.post<Trajet>(`${(this.url)}`, trajet)
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${(this.url)}/all`,)
  }


  getById(id: number): Observable<Trajet> {
    return this.http.get<Trajet>(`${this.url}/${id}`);
  }


  updateStatus(id: number, status: string): Observable<Trajet> {
    return this.http.patch<Trajet>(`${this.url}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/delete/${id}`);
  }
}
