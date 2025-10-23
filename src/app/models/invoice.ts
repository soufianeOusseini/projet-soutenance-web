export class Invoice{
  id?: number;
  invoiceNumber?: string;
  companyId?: number;
  companyName?: string;
  subscriptionId?: number;
  amount?: number;
  status?: string;
  issueDate?: Date;
  dueDate?: Date;
  paymentDate?: Date;
  paymentMethod?: string;
}

export class InvoiceCreate{
  companyId?:number;
  subscriptionId?:number;
  amount?:number;
  issueDate?:Date;
  dueDate?:Date;
}

export class PayInvoice{
  paymentMethod?:string;
  paymentDate?:Date;
}
