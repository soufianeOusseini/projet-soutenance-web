import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DriverStatus} from "../models/enums/driver-status";
import {Driver} from "../models/driver.model";

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  url = "http://localhost:8080/api/driver";
  constructor(private http: HttpClient) { }


  save(driver: Driver): Observable<Driver> {
    return this.http.post<Driver>(`${(this.url)}`, driver)
  }

  getAll(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${(this.url)}/all`,)
  }


  getById(id: number): Observable<Driver> {
    return this.http.get<Driver>(`${this.url}/${id}`);
  }


  updateStatus(id: number, status: string): Observable<Driver> {
    return this.http.patch<Driver>(`${this.url}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/delete/${id}`);
  }
}
