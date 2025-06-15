import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Reservation} from "../models/reservation.model";
import {Observable} from "rxjs";
import {Ticket} from "../models/ticket.model";

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  url = "http://localhost:8080/api/ticket";
  constructor(private http: HttpClient) { }


  save(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(`${(this.url)}`, ticket)
  }

  getAll(): Observable<Ticket[]> {
    return this.http.get<any[]>(`${this.url}/all`);
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<any>(`${this.url}/${id}`);
  }


  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
