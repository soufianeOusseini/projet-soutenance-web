import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CompanieModel} from "../models/companie.model";
import {Observable} from "rxjs";
import {Colis} from "../models/colis.model";
import {Bus} from "../models/bus.model";

@Injectable({
  providedIn: 'root'
})
export class ColisService {

  url = "http://localhost:8080/api/colis";
  constructor(private http: HttpClient) { }


  save(colis: Colis): Observable<Colis> {
    return this.http.post<Colis>(`${(this.url)}`, colis)
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${(this.url)}/all`,)
  }


  getById(id: number): Observable<Colis> {
    return this.http.get<Colis>(`${this.url}/${id}`);
  }


  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/delete/${id}`);
  }

  /**
   * Nouvelle méthode pour mettre à jour le statut d'un colis
   */
  updateStatus(id: number, status: string): Observable<Colis> {
    return this.http.patch<Colis>(`${this.url}/${id}/status`, { status });
  }

  /**
   * Méthode pour obtenir les transitions de statut possibles
   */
  getAvailableStatusTransitions(id: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/${id}/available-status-transitions`);
  }
}


