import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CompaniesComponent} from "./companies/companies.component";
import {AdminComponent} from "./admin.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {BusComponent} from "./bus/bus.component";
import {TrajetComponent} from "./trajet/trajet.component";
import {ColisComponent} from "./colis/colis.component";
import {TicketComponent} from "./ticket/ticket.component";
import {ReservationComponent} from "./reservation/reservation.component";
import {StaffsComponent} from "./staffs/staffs.component";
import {DetailComponent} from "./colis/detail/detail.component";
import {ProfilComponent} from "./profil/profil.component";


const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'companies',
        component: CompaniesComponent,
      },
      {
        path: 'bus',
        component: BusComponent,
      },
      {
        path: 'trips',
        component: TrajetComponent,
      },
      {
        path: 'colis',
        component: ColisComponent,
      },
      {
        path: 'colis/detail/:id',
        component: DetailComponent
      },
      {
        path: 'tickets',
        component: TicketComponent,
      },
      {
        path: 'reservations',
        component: ReservationComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'staffs',
        component: StaffsComponent,
      },
      {
        path: '',
        redirectTo: 'companies',
        pathMatch: 'full'
      },
      {
        path: 'profil', component: ProfilComponent
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
