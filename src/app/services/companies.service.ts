import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "../models/user";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Companie} from "../models/companie";

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  url = "api/v1/companies";
  constructor(private http: HttpClient) { }


  save(companies: Companie): Observable<Companie> {
    return this.http.post<Companie>(`${(this.url)}`, companies)
  }
}
