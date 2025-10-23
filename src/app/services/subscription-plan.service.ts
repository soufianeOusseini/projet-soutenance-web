
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {SubscriptionPlan, SubscriptionPLanCreate} from "../models/subscription-plan";


@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {
  private apiUrl = 'http://localhost:8080/api/subscription-plans';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Créer un nouveau plan d'abonnement
   */
  createPlan(plan: SubscriptionPLanCreate): Observable<SubscriptionPlan> {
    return this.http.post<SubscriptionPlan>(
      this.apiUrl,
      plan,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour un plan d'abonnement
   */
  updatePlan(id: number, plan: SubscriptionPLanCreate): Observable<SubscriptionPlan> {
    return this.http.put<SubscriptionPlan>(
      `${this.apiUrl}/${id}`,
      plan,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Désactiver un plan d'abonnement
   */
  deactivatePlan(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/deactivate`,
      {},
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Activer un plan d'abonnement
   */
  activatePlan(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/activate`,
      {},
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir un plan par son ID
   */
  getPlan(id: number): Observable<SubscriptionPlan> {
    return this.http.get<SubscriptionPlan>(
      `${this.apiUrl}/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir tous les plans d'abonnement
   */
  getAllPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(
      this.apiUrl
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir uniquement les plans actifs
   */
  getActivePlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(
      `${this.apiUrl}/active`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('Erreur dans SubscriptionPlanService:', error);
    return throwError(() => error);
  }
}



