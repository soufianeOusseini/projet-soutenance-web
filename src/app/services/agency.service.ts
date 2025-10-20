import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AgencyModel} from "../models/agency";

@Injectable({
  providedIn: 'root'
})
export class AgencyService {
  private apiUrl = 'http://localhost:8080/api/agencies';

  constructor(private http: HttpClient) { }

  getAgenciesByCompany(): Observable<AgencyModel[]> {
    return this.http.get<AgencyModel[]>(`${this.apiUrl}/company`);
  }

  getAgenciesByCompanyId(id: number): Observable<AgencyModel[]> {
    return this.http.get<AgencyModel[]>(`${this.apiUrl}/company/${id}`);
  }

  getAgencyById(id: number): Observable<AgencyModel> {
    return this.http.get<AgencyModel>(`${this.apiUrl}/${id}`);
  }

  createAgency(agency: AgencyModel): Observable<AgencyModel> {
    return this.http.post<AgencyModel>(this.apiUrl, agency);
  }

  updateAgency(id: number, agency: AgencyModel): Observable<AgencyModel> {
    return this.http.put<AgencyModel>(`${this.apiUrl}/${id}`, agency);
  }

  deleteAgency(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  changeAgencyStatus(id: number, status: string): Observable<AgencyModel> {
    return this.http.patch<AgencyModel>(`${this.apiUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  searchAgencies(companyId: number, keyword: string): Observable<AgencyModel[]> {
    return this.http.get<AgencyModel[]>(`${this.apiUrl}/company/${companyId}/search`, {
      params: { keyword }
    });
  }

  getAgencyStats(companyId: number): Observable<AgencyStats> {
    return this.http.get<AgencyStats>(`${this.apiUrl}/company/${companyId}/stats`);
  }

  getAllAgencies(): Observable<any> {
      return this.http.get<any>(`${(this.apiUrl)}/company`,)
  }

}

export interface AgencyStats {
  totalAgencies: number;
  activeAgencies: number;
  inactiveAgencies: number;
}
