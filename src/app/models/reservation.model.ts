export class Reservation {
  id?: number;
  date: Date | undefined;
  status: string | undefined;
  nombrePlace: number | undefined;
  prix: number | undefined;
  modePaiement: string | undefined;
  trajetId: number | undefined;
  ticketId: number | undefined;
}
