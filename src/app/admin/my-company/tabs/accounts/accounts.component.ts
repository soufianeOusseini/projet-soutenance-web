import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CompanieModel } from "../../../../models/companie.model";
import { CompanyAccountService, AccountSummary } from "../../../../services/company-account.service";
import {CompanyAccount} from "../../../../models/company-account";

@Component({
  selector: 'app-accounts',
  standalone: false,
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent implements OnInit, OnDestroy {
  @Input() company: CompanieModel | null = null;
  @Input() user: any;
  @Input() formGroup!: FormGroup;

  accounts: CompanyAccount[] = [];
  showAddForm = false;
  editingAccount: CompanyAccount | null = null;
  accountForm: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  // Propriétés calculées
  totalBalance = 0;
  totalCreditLimit = 0;
  activeAccounts = 0;

  constructor(
    private fb: FormBuilder,
    private accountService: CompanyAccountService
  ) {
    this.accountForm = this.createAccountForm();
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadAccountSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createAccountForm(): FormGroup {
    return this.fb.group({
      id: [null],
      accountName: ['', [Validators.required]],
      type: ['PRINCIPAL', [Validators.required]],
      balance: [0, [Validators.min(0)]],
      creditLimit: [0, [Validators.min(0)]],
      notes: ['']
    });
  }

  loadAccounts(): void {
    if (!this.company?.id) return;

    this.loading = true;
    this.accountService.getAccountsByCompany(this.company.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          this.calculateTotals();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des comptes:', error);
          this.loading = false;
        }
      });
  }

  loadAccountSummary(): void {
    if (!this.company?.id) return;

    this.accountService.getAccountSummary(this.company.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary: AccountSummary) => {
          this.totalBalance = summary.totalBalance;
          this.totalCreditLimit = summary.totalCreditLimit;
          this.activeAccounts = summary.activeAccounts;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du résumé:', error);
        }
      });
  }

  calculateTotals(): void {
    this.totalBalance = this.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    this.totalCreditLimit = this.accounts.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0);
    this.activeAccounts = this.accounts.filter(acc => acc.status === 'ACTIVE').length;
  }

  showAddAccountForm(): void {
    this.showAddForm = true;
    this.editingAccount = null;
    this.accountForm.reset();
    this.accountForm.patchValue({ type: 'PRINCIPAL', balance: 0, creditLimit: 0 });
  }

  editAccount(account: CompanyAccount): void {
    this.editingAccount = account;
    this.showAddForm = true;
    this.accountForm.patchValue(account);
  }

  saveAccount(): void {
    if (this.accountForm.valid && this.company?.id) {
      const accountData = { ...this.accountForm.value, companyId: this.company.id };
      this.loading = true;

      const saveOperation = this.editingAccount
        ? this.accountService.updateAccount(this.editingAccount.id!, accountData)
        : this.accountService.createAccount(accountData);

      saveOperation
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.cancelAccountForm();
            this.loadAccounts();
            this.loadAccountSummary();
            this.loading = false;
          },
          error: (error) => {
            console.error('Erreur lors de la sauvegarde:', error);
            this.loading = false;
          }
        });
    }
  }

  toggleAccountStatus(account: CompanyAccount): void {
    if (!account.id) return;

    const newStatus = account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'activer' : 'désactiver';

    if (confirm(`Voulez-vous ${action} le compte "${account.accountName}" ?`)) {
      this.loading = true;
      this.accountService.changeAccountStatus(account.id, newStatus)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadAccounts();
            this.loadAccountSummary();
            this.loading = false;
          },
          error: (error) => {
            console.error('Erreur lors du changement de statut:', error);
            this.loading = false;
          }
        });
    }
  }

  viewTransactions(account: CompanyAccount): void {
    // TODO: Navigation vers la page des transactions
    console.log('View transactions for account:', account.id);
  }

  cancelAccountForm(): void {
    this.showAddForm = false;
    this.editingAccount = null;
    this.accountForm.reset();
  }

  getAccountTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'PRINCIPAL': 'Principal',
      'SECONDARY': 'Secondaire',
      'SAVINGS': 'Épargne',
      'CREDIT': 'Crédit'
    };
    return typeMap[type] || type;
  }

  getAccountStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'SUSPENDED': 'Suspendu',
      'BLOCKED': 'Bloqué',
      'CLOSED': 'Fermé'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'ACTIVE': 'success',
      'INACTIVE': 'secondary',
      'SUSPENDED': 'warning',
      'BLOCKED': 'danger',
      'CLOSED': 'dark'
    };
    return classMap[status] || 'secondary';
  }

}
