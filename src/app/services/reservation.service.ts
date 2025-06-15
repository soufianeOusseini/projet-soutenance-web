import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Colis} from "../models/colis.model";
import {Observable} from "rxjs";
import {Reservation} from "../models/reservation.model";

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  url = "http://localhost:8080/api/reservation";
  constructor(private http: HttpClient) { }


  save(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(`${(this.url)}`, reservation)
  }
}
