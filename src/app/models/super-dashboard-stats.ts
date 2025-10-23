export interface DashboardStats {
  totalCompanies: number;
  totalAgencies: number;
  totalTickets: number;
  totalSales: number;
  monthlySales: MonthlySales[];
}

export interface MonthlySales {
  month: string;
  sales: number;
}
