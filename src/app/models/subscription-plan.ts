export class SubscriptionPlan{
  id?: number;
  name?: string;
  price?: number;
  durationInDays?: number;
  description?: string;
  active?: boolean;
}
export class SubscriptionPLanCreate{
  name?:string;
  price?:number;
  durationInDays?:number;
  description?:string;
}
