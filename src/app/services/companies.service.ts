import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "../models/user";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {CompanieModel} from "../models/companie.model";
import {Bus} from "../models/bus.model";

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {

  url = "http://localhost:8080/api/company";
  constructor(private http: HttpClient) { }


  save(companies: CompanieModel): Observable<CompanieModel> {
    return this.http.post<CompanieModel>(`${(this.url)}/add`, companies)
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${(this.url)}/all`,)
  }


  getById(id: number): Observable<CompanieModel> {
    return this.http.get<CompanieModel>(`${this.url}/${id}`);
  }



  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/delete/${id}`);
  }

  changeStatus(id: number): Observable<void>{
    return this.http.get<void>(`${this.url}/change-status/${id}`);
  }
}
