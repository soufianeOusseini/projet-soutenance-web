import {Component, OnInit} from '@angular/core';
import {TripSchedule, TripScheduleDTO} from "../../models/trip-schedule";
import {TripScheduleService} from "../../services/trip-schedule.service";
import {BusService} from "../../services/bus.service";
import {TrajetService} from "../../services/trajet.service";
import {DriverService} from "../../services/driver.service";
import {showHttpError, showSuccess} from "../../utils/message.util";
import {ConfirmDeleteComponent} from "../../utils/confirm-delete/confirm-delete.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

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

  trajets: any[] = [];
  buses: any[] = [];
  drivers: any[] = [];
  companies: any[] = [];

  currentMonth: Date = new Date();
  calendarDays: any[] = [];
  monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  constructor(
    private tripScheduleService: TripScheduleService,
    private driverService: DriverService,
    private busService: BusService,
    private trajetService: TrajetService,
    private modalService: NgbModal,
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
      nombrePlacesTotales: 0,
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
          .filter(s => s.heureDepart)
          .sort((a, b) => a.heureDepart!.localeCompare(b.heureDepart!)),
        schedulesCount: daySchedules.length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

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
        showHttpError(error)
        console.error(error);
      }
    });
  }

  loadFormOptions(): void {
    this.busService.getAll().subscribe({
      next: (data) => {
        this.buses = data;
      },
      error: (error) => {
        showHttpError(error)
        console.error(error);
      }
    });

    this.trajetService.getAll().subscribe({
      next: (data) => {
        this.trajets = data;
      },
      error: (error) => {
        showHttpError(error)
        console.error( error);
      }
    });

    this.driverService.getAll().subscribe({
      next: (data) => {
        this.drivers = data;
      },
      error: (error) => {
        showHttpError(error)
        console.error(error);
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

  selectDate(day: any): void {
    if (day.isCurrentMonth) {
      this.selectedDate = day.date.toISOString().split('T')[0];

      if (day.schedulesCount > 0) {
        this.showDaySchedules(day);
      } else {
        this.openModal();
      }
    }
  }

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
      setTimeout(() => this.onBusChange(), 0);
    } else {
      this.isEditMode = false;
      this.currentSchedule = this.initializeSchedule();
      if (this.selectedDate) {
        this.currentSchedule.dateDepart = this.selectedDate;
      }
    }
    this.showModal = true;
  }

  editSchedule(schedule: TripSchedule): void {
    this.closeDayModal();
    this.openModal(schedule);
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSchedule = this.initializeSchedule();
    this.currentScheduleId = null;
    this.isEditMode = false;
  }

  onBusChange(): void {
    const busId = this.currentSchedule.busId;
    if (busId && busId !== 0) {
      const selectedBus = this.buses.find(bus => bus.id == busId);
      if (selectedBus) {
        this.currentSchedule.nombrePlacesTotales = selectedBus.capacity || selectedBus.nombrePlaces || 50;
      }
    } else {
      this.currentSchedule.nombrePlacesTotales = 0;
    }
  }

  onSubmit(): void {
    if (this.isEditMode && this.currentScheduleId) {
      this.tripScheduleService.updateSchedule(this.currentScheduleId, this.currentSchedule)
        .subscribe({
          next: () => {
            showSuccess()
            this.loadSchedules();
            this.closeModal();
          },
          error: (error) => {
            showHttpError(error)
            console.error(error);
          }
        });
    } else {
      this.tripScheduleService.createSchedule(this.currentSchedule)
        .subscribe({
          next: () => {
            showSuccess()
            this.loadSchedules();
            this.closeModal();
          },
          error: (error) => {
            showHttpError(error)
            console.error(error);
          }
        });
    }
  }


  deleteSchedule(scheduleId: number): void {
    this.tripScheduleService.deleteSchedule(scheduleId)
      .subscribe({
        next: () => {
          showSuccess()
          this.loadSchedules();
          this.closeDayModal(); // Fermer le modal si ouvert
          console.log('Planification supprimée avec succès');
        },
        error: (error) => {
          showHttpError(error)
          console.error('Erreur lors de la suppression', error);
        }
      });
  }


  confirmDelete(id: any) {
    const modalRef = this.modalService.open(ConfirmDeleteComponent, {
      centered: true,
    })
    modalRef.result.then(
      (result) => {
        this.deleteSchedule(id)
        this.closeModal()
      },
      (error) => {
        console.error(error)
      },
    )
  }

  showDaySchedules(day: any): void {
    this.selectedDayData = { ...day };
    this.selectedDate = day.date.toISOString().split('T')[0];
    this.showDayModal = true;
  }

  closeDayModal(): void {
    this.showDayModal = false;
    this.selectedDayData = null;
  }

  addScheduleToDay(): void {
    this.closeDayModal();
    this.openModal();
  }

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
