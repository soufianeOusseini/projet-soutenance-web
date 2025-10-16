export class TripSchedule {
  id?: number;
  trajet: any;
  bus: any;
  driver: any;
  agency: any;
  dateDepart?: string;
  heureDepart?: string;
  nombrePlacesTotales?: number;
  nombrePlacesDisponibles?: number;
  prix?: number;
  status?: string;
}

export class TripScheduleDTO {
  trajetId?: number;
  busId?: number;
  driverId?: number;
  agencyId?: number;
  dateDepart?: string;
  heureDepart?: string;
  nombrePlacesTotales?: number;
  prix?: number;
}
