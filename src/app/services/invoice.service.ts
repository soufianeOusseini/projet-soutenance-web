import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {Invoice, InvoiceCreate, PayInvoice} from "../models/invoice";
import {InvoiceStatus} from "../models/enums/invoice-status";


@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8080/api/invoices';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Créer une nouvelle facture manuellement
   */
  createInvoice(invoice: InvoiceCreate): Observable<Invoice> {
    return this.http.post<Invoice>(
      this.apiUrl,
      invoice,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Payer une facture
   */
  payInvoice(id: number, payment: PayInvoice): Observable<Invoice> {
    return this.http.patch<Invoice>(
      `${this.apiUrl}/${id}/pay`,
      payment,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Annuler une facture
   */
  cancelInvoice(id: number): Observable<Invoice> {
    return this.http.patch<Invoice>(
      `${this.apiUrl}/${id}/cancel`,
      {},
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir une facture par son ID
   */
  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(
      `${this.apiUrl}/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir une facture par son numéro
   */
  getInvoiceByNumber(invoiceNumber: string): Observable<Invoice> {
    return this.http.get<Invoice>(
      `${this.apiUrl}/number/${invoiceNumber}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir toutes les factures d'une compagnie
   */
  getInvoicesByCompany(companyId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(
      `${this.apiUrl}/company/${companyId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir les factures en attente d'une compagnie
   */
  getPendingInvoicesByCompany(companyId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(
      `${this.apiUrl}/company/${companyId}/pending`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir toutes les factures en retard
   */
  getOverdueInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(
      `${this.apiUrl}/overdue`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir les factures d'un abonnement
   */
  getInvoicesBySubscription(subscriptionId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(
      `${this.apiUrl}/subscription/${subscriptionId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir toutes les factures
   */
  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(
      this.apiUrl
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir les factures par statut
   */
  getInvoicesByStatus(status: InvoiceStatus): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(
      `${this.apiUrl}/status/${status}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Télécharger une facture en PDF
   */
  downloadInvoicePdf(invoiceId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${invoiceId}/pdf`,
      { responseType: 'blob' }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Envoyer une facture par email
   */
  sendInvoiceByEmail(invoiceId: number, email: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${invoiceId}/send-email`,
      { email },
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('Erreur dans InvoiceService:', error);
    return throwError(() => error);
  }

}
