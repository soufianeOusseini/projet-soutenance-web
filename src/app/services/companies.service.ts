import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "../models/user";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {CompanieModel} from "../models/companie.model";

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  url = "api/v1/companies";
  constructor(private http: HttpClient) { }


  save(companies: CompanieModel): Observable<CompanieModel> {
    return this.http.post<CompanieModel>(`${(this.url)}`, companies)
  }
}
