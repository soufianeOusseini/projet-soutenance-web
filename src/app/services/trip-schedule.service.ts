import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {TripSchedule, TripScheduleDTO} from "../models/trip-schedule";

@Injectable({
  providedIn: 'root'
})
export class TripScheduleService {
  private apiUrl = 'http://localhost:8080/api/trip-schedules';

  constructor(private http: HttpClient) { }

  getAllSchedules(): Observable<TripSchedule[]> {
    return this.http.get<TripSchedule[]>(this.apiUrl);
  }

  getScheduleById(id: number): Observable<TripSchedule> {
    return this.http.get<TripSchedule>(`${this.apiUrl}/${id}`);
  }

  getSchedulesByDate(date: string): Observable<TripSchedule[]> {
    return this.http.get<TripSchedule[]>(`${this.apiUrl}/date/${date}`);
  }

  getSchedulesByDateRange(startDate: string, endDate: string): Observable<TripSchedule[]> {
    return this.http.get<TripSchedule[]>(`${this.apiUrl}/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  createSchedule(schedule: TripScheduleDTO): Observable<TripScheduleDTO> {
    return this.http.post<TripSchedule>(this.apiUrl, schedule);
  }

  updateSchedule(id: number, schedule: TripScheduleDTO): Observable<TripScheduleDTO> {
    return this.http.put<TripSchedule>(`${this.apiUrl}/${id}`, schedule);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
