export class TripSchedule {
  id?: number;
  trajet: any;
  bus: any;
  driver: any;
  company: any;
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
  companyId?: number;
  dateDepart?: string;
  heureDepart?: string;
  nombrePlacesTotales?: number;
  prix?: number;
}
