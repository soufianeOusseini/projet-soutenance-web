export class Ticket {
  id?: number;
  prix: number | undefined;
  numero: string | undefined;
  status: string | undefined;
  date: Date | undefined;
  heureDepart: string | undefined;
  userId: number | undefined;
  trajetId: number | undefined;
  modePaiement: string | undefined;
}
