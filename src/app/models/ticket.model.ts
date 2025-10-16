export class Ticket {
  id?: number;
  prix: number | undefined;
  numero: string | undefined;
  status: string | undefined;
  date: Date | undefined;
  heureDepart: string | undefined;
  trajetId: number | undefined;
  modePaiement: string | undefined;

  // Nouvelles propriétés client
  clientNom?: string;
  clientPrenom?: string;
  clientContact?: string;

  // Type de transaction et réservation
  typeTransaction?: string; // 'ACHAT' | 'RESERVATION'
  dateLimitePaiement?: string;

  // Informations supplémentaires
  trajetInfo?: string;
  agencyName?: string;
  userId?: number;
  reservationId?: number;
}
