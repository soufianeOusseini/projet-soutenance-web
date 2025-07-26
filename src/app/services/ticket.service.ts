import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Reservation} from "../models/reservation.model";
import {Observable} from "rxjs";
import {Ticket} from "../models/ticket.model";

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = "http://localhost:8080/api/ticket";

  constructor(private http: HttpClient) {}

  getAll(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/all`);
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  save(ticket: Ticket): Observable<Ticket> {
    if (ticket.id) {
      return this.http.put<Ticket>(`${this.apiUrl}/${ticket.id}`, ticket);
    } else {
      return this.http.post<Ticket>(this.apiUrl, ticket);
    }
  }

  /**
   * Nouvelle méthode pour la vente de tickets avec informations client
   */
  vendre(ticketData: any): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/vendre`, ticketData);
  }

  /**
   * Calculer le nombre de places restantes pour un trajet à une date donnée
   */
  getPlacesRestantes(trajetId: number, date: string): Observable<number> {
    const params = new HttpParams()
      .set('trajetId', trajetId.toString())
      .set('date', date);

    return this.http.get<number>(`${this.apiUrl}/places-restantes`, { params });
  }

  /**
   * Obtenir les statistiques de vente pour un trajet
   */
  getStatistiquesVente(trajetId: number, dateDebut: string, dateFin: string): Observable<any> {
    const params = new HttpParams()
      .set('trajetId', trajetId.toString())
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<any>(`${this.apiUrl}/statistiques`, { params });
  }

  /**
   * Annuler un ticket
   */
  annuler(id: number, motif: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${id}/annuler`, { motif });
  }

  /**
   * Marquer un ticket comme utilisé
   */
  utiliser(id: number): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${id}/utiliser`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  /**
   * Rechercher des tickets par critères
   */
  rechercher(criteres: any): Observable<Ticket[]> {
    let params = new HttpParams();

    Object.keys(criteres).forEach(key => {
      if (criteres[key] !== null && criteres[key] !== undefined && criteres[key] !== '') {
        params = params.set(key, criteres[key].toString());
      }
    });

    return this.http.get<Ticket[]>(`${this.apiUrl}/rechercher`, { params });
  }

  /**
   * Générer un rapport de ventes
   */
  genererRapport(dateDebut: string, dateFin: string, format: 'PDF' | 'EXCEL' = 'PDF'): Observable<Blob> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin)
      .set('format', format);

    return this.http.get(`${this.apiUrl}/rapport`, {
      params,
      responseType: 'blob'
    });
  }
}
