// agency.model.ts
export interface AgencyModel {
  id?: number;
  name: string;
  code: string;
  address?: string;
  telephone: string;
  city: string;
  region?: string;
  email?: string;
  managerName?: string;
  managerPhone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  companyId: number;
  companyName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

