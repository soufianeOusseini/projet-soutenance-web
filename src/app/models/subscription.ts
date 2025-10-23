export class Subscription{
  id?: number;
  companyId?: number;
  companyName?: string;
  planId?: number;
  planName?: string;
  planPrice?: number;
  startDate?: Date;
  endDate?: Date;
  active?: boolean;
  autoRenew?: boolean;
  cancelledAt?: Date;
  company?: any
  plan: any
}
export class SubscriptionCreate{
  companyId?:number;
  planId?:number;
  startDate?:Date;
  autoRenew?: boolean;
}
export class RenewSubscription{
  subscriptionId?: number
  planId?:number;
}
