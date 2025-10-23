import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {DashboardStats} from "../models/super-dashboard-stats";

export interface StatistiquesGenerales {
  totalTrips: number;
  percentageTripsChange: number;
  totalPassengers: number;
  percentagePassengersChange: number;
  totalEarnings: number;
  percentageEarningsChange: number;
  totalTickets: number;
  percentageTicketsChange: number;
  totalReservations: number;
  percentageReservationsChange: number;
  totalColis: number;
  percentageColisChange: number;
}

export interface RevenueByDay {
  day: string;
  amount: number;
}

export interface Revenus {
  revenusToday: number;
  revenusThisMonth: number;
  percentageMonthChange: number;
  revenuesByDay: RevenueByDay[];
}

export interface ColisStatistics {
  totalColis: number;
  colisDelivered: number;
  colisPending: number;
  colisInTransit: number;
  percentageDelivered: number;
  deliveryRate: number;
}

export interface TrajetRepartition {
  route: string;
  count: number;
}

export interface ActiviteRecente {
  type: string;
  description: string;
  timeAgo: string;
}

export interface Dashboard {
  statistiquesGenerales: StatistiquesGenerales;
  revenus: Revenus;
  colisStatistics: ColisStatistics;
  trajetRepartition: TrajetRepartition[];
  activitesRecentes: ActiviteRecente[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) { }

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(this.apiUrl);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
