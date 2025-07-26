import {Component, OnInit} from '@angular/core';
import {TripSchedule, TripScheduleDTO} from "../../models/trip-schedule";
import {TripScheduleService} from "../../services/trip-schedule.service";
import {BusService} from "../../services/bus.service";
import {TrajetService} from "../../services/trajet.service";
import {DriverService} from "../../services/driver.service";

@Component({
  selector: 'app-planning',
  standalone: false,
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.css'
})
export class PlanningComponent implements OnInit{
  schedules: TripSchedule[] = [];
  selectedDate: string = '';
  showModal: boolean = false;
  showDayModal: boolean = false;
  selectedDayData: any = null;
  isEditMode: boolean = false;
  currentSchedule: TripScheduleDTO = this.initializeSchedule();
  currentScheduleId: number | null = null;

  // Options pour les formulaires
  trajets: any[] = [];
  buses: any[] = [];
  drivers: any[] = [];
  companies: any[] = [];

  // Calendrier
  currentMonth: Date = new Date();
  calendarDays: any[] = [];
  monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  constructor(
    private tripScheduleService: TripScheduleService,
    private driverService: DriverService,
    private busService: BusService,
    private trajetService: TrajetService
  ) { }

  ngOnInit(): void {
    this.generateCalendar();
    this.loadSchedules();
    this.loadFormOptions();
  }

  initializeSchedule(): TripScheduleDTO {
    return {
      trajetId: 0,
      busId: 0,
      driverId: 0,
      companyId: 0,
      dateDepart: '',
      heureDepart: '08:00',
      nombrePlacesTotales: 50,
      prix: 0
    };
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const daySchedules = this.schedules.filter(s =>
        s.dateDepart === currentDate.toISOString().split('T')[0]
      );

      this.calendarDays.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isToday(currentDate),
        schedules: daySchedules
          .filter(s => s.heureDepart) // Filtrer les éléments sans heureDepart
          .sort((a, b) => a.heureDepart!.localeCompare(b.heureDepart!)),
        schedulesCount: daySchedules.length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Méthode pour organiser les jours en semaines
  getCalendarWeeks(): any[][] {
    const weeks = [];
    for (let i = 0; i < this.calendarDays.length; i += 7) {
      weeks.push(this.calendarDays.slice(i, i + 7));
    }
    return weeks;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  loadSchedules(): void {
    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    this.tripScheduleService.getSchedulesByDateRange(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    ).subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.generateCalendar();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des planifications', error);
      }
    });
  }

  loadFormOptions(): void {
    this.busService.getAll().subscribe({
      next: (data) => {
        this.buses = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des bus', error);
      }
    });

    this.trajetService.getAll().subscribe({
      next: (data) => {
        this.trajets = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des trajets', error);
      }
    });

    this.driverService.getAll().subscribe({
      next: (data) => {
        this.drivers = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des chauffeurs', error);
      }
    });
  }

  previousMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.loadSchedules();
  }

  nextMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.loadSchedules();
  }

  // Méthode corrigée pour la sélection de date
  selectDate(day: any): void {
    if (day.isCurrentMonth) {
      this.selectedDate = day.date.toISOString().split('T')[0];

      // Si le jour a des planifications, afficher le modal du jour
      if (day.schedulesCount > 0) {
        this.showDaySchedules(day);
      } else {
        // Sinon, ouvrir directement le modal de création
        this.openModal();
      }
    }
  }

  // Ouvrir le modal de création/édition
  openModal(schedule?: TripSchedule): void {
    if (schedule) {
      // Mode édition
      this.isEditMode = true;
      this.currentScheduleId = schedule.id!;
      this.currentSchedule = {
        trajetId: schedule.trajet.id,
        busId: schedule.bus.id,
        driverId: schedule.driver.id,
        companyId: schedule.company?.id || 0,
        dateDepart: schedule.dateDepart,
        heureDepart: schedule.heureDepart,
        nombrePlacesTotales: schedule.nombrePlacesTotales,
        prix: schedule.prix
      };
    } else {
      // Mode création
      this.isEditMode = false;
      this.currentSchedule = this.initializeSchedule();
      if (this.selectedDate) {
        this.currentSchedule.dateDepart = this.selectedDate;
      }
    }
    this.showModal = true;
  }

  // Méthode séparée pour éditer une planification
  editSchedule(schedule: TripSchedule): void {
    this.closeDayModal(); // Fermer le modal du jour si ouvert
    this.openModal(schedule);
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSchedule = this.initializeSchedule();
    this.currentScheduleId = null;
    this.isEditMode = false;
  }

  onSubmit(): void {
    if (this.isEditMode && this.currentScheduleId) {
      this.tripScheduleService.updateSchedule(this.currentScheduleId, this.currentSchedule)
        .subscribe({
          next: () => {
            this.loadSchedules();
            this.closeModal();
            console.log('Planification mise à jour avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour', error);
          }
        });
    } else {
      this.tripScheduleService.createSchedule(this.currentSchedule)
        .subscribe({
          next: () => {
            this.loadSchedules();
            this.closeModal();
            console.log('Planification créée avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de la création', error);
          }
        });
    }
  }

  // Méthode pour confirmer la suppression
  confirmDeleteSchedule(scheduleId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette planification ?')) {
      this.deleteSchedule(scheduleId);
    }
  }

  deleteSchedule(scheduleId: number): void {
    this.tripScheduleService.deleteSchedule(scheduleId)
      .subscribe({
        next: () => {
          this.loadSchedules();
          this.closeDayModal(); // Fermer le modal si ouvert
          console.log('Planification supprimée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      });
  }

  // Afficher toutes les planifications d'un jour spécifique
  showDaySchedules(day: any): void {
    this.selectedDayData = { ...day }; // Copie pour éviter les références
    this.selectedDate = day.date.toISOString().split('T')[0];
    this.showDayModal = true;
  }

  // Fermer le modal des planifications du jour
  closeDayModal(): void {
    this.showDayModal = false;
    this.selectedDayData = null;
  }

  // Ajouter une planification au jour sélectionné
  addScheduleToDay(): void {
    this.closeDayModal();
    this.openModal(); // Ouvrir le modal de création avec la date pré-remplie
  }

  // Méthodes de tracking pour optimiser les performances
  trackByWeek(index: number, week: any[]): number {
    return index;
  }

  trackByDay(index: number, day: any): string {
    return day.date.toISOString();
  }

  trackBySchedule(index: number, schedule: TripSchedule): number {
    return schedule.id || index;
  }
}
