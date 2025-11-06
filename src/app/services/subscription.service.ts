
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {RenewSubscription, Subscription, SubscriptionCreate} from "../models/subscription";


@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = 'http://localhost:8080/api/subscriptions';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Créer un nouvel abonnement
   */
  createSubscription(subscription: SubscriptionCreate): Observable<Subscription> {
    return this.http.post<Subscription>(
      this.apiUrl,
      subscription,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Renouveler un abonnement existant
   */
  renewSubscription(renewal: RenewSubscription): Observable<Subscription> {
    return this.http.post<Subscription>(
      `${this.apiUrl}/renew`,
      renewal,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Annuler un abonnement
   */
  cancelSubscription(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/cancel`,
      {},
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir l'abonnement actif d'une compagnie
   */
  getActiveSubscriptionByCompany(companyId: number): Observable<Subscription> {
    return this.http.get<Subscription>(
      `${this.apiUrl}/company/${companyId}/active`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir tous les abonnements d'une compagnie
   */
  getSubscriptionsByCompany(companyId: number): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(
      `${this.apiUrl}/company/${companyId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir les abonnements qui expirent dans X jours
   */
  getExpiringSubscriptions(days: number = 7): Observable<Subscription[]> {
    const params = new HttpParams().set('days', days.toString());

    return this.http.get<Subscription[]>(
      `${this.apiUrl}/expiring`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Traiter les abonnements expirés (renouvellement automatique)
   */
  processExpiredSubscriptions(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/process-expired`,
      {},
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir un abonnement par son ID
   */
  getSubscriptionById(id: number): Observable<Subscription> {
    return this.http.get<Subscription>(
      `${this.apiUrl}/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir tous les abonnements
   */
  getAllSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(
      this.apiUrl
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('Erreur dans SubscriptionService:', error);
    return throwError(() => error);
  }

  updateAutoRenew(subscriptionId: number, autoRenew: boolean): Observable<Subscription> {
    return this.http.patch<Subscription>(
      `${this.apiUrl}/${subscriptionId}/auto-renew`,
       autoRenew ,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }
}
