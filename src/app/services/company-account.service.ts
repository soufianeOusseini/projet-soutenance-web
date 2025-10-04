import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CompanyAccount} from "../models/company-account";

@Injectable({
  providedIn: 'root'
})
export class CompanyAccountService {
  private apiUrl = 'http://localhost:8080/api/company-accounts';

  constructor(private http: HttpClient) { }

  getAccountsByCompany(companyId: number): Observable<CompanyAccount[]> {
    return this.http.get<CompanyAccount[]>(`${this.apiUrl}/company/${companyId}`);
  }

  getAccountById(id: number): Observable<CompanyAccount> {
    return this.http.get<CompanyAccount>(`${this.apiUrl}/${id}`);
  }

  createAccount(account: CompanyAccount): Observable<CompanyAccount> {
    return this.http.post<CompanyAccount>(this.apiUrl, account);
  }

  updateAccount(id: number, account: CompanyAccount): Observable<CompanyAccount> {
    return this.http.put<CompanyAccount>(`${this.apiUrl}/${id}`, account);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  changeAccountStatus(id: number, status: string): Observable<CompanyAccount> {
    return this.http.patch<CompanyAccount>(`${this.apiUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  updateBalance(id: number, newBalance: number): Observable<CompanyAccount> {
    return this.http.patch<CompanyAccount>(`${this.apiUrl}/${id}/balance`, null, {
      params: { newBalance: newBalance.toString() }
    });
  }

  transferFunds(transferRequest: TransferRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/transfer`, transferRequest);
  }

  getAccountSummary(companyId: number): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(`${this.apiUrl}/company/${companyId}/summary`);
  }

  getPrincipalAccount(companyId: number): Observable<CompanyAccount> {
    return this.http.get<CompanyAccount>(`${this.apiUrl}/company/${companyId}/principal`);
  }
}

export interface TransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
}

export interface AccountSummary {
  totalBalance: number;
  totalCreditLimit: number;
  activeAccounts: number;
  totalAccounts: number;
  principalAccount?: CompanyAccount;
}
