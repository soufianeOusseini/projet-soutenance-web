// company-account.model.ts
export interface CompanyAccount {
  id?: number;
  accountNumber?: string;
  accountName: string;
  balance: number;
  creditLimit: number;
  type: 'PRINCIPAL' | 'SECONDARY' | 'SAVINGS' | 'CREDIT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'CLOSED';
  notes?: string;
  agencyId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
