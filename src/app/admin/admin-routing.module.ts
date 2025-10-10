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
import {DetailComponent} from "./colis/detail/detail.component";
import {ProfilComponent} from "./profil/profil.component";
import {MyCompanyComponent} from "./my-company/my-company.component";
import {DriverComponent} from "./driver/driver.component";
import {PlanningComponent} from "./planning/planning.component";
import {UsersManagementComponent} from "./users-management/users-management.component";
import {RoleComponent} from "./account/role/role.component";
import {PermissionComponent} from "./account/permission/permission.component";


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
        path: '',
        redirectTo: 'companies',
        pathMatch: 'full'
      },
      {
        path: 'profil', component: ProfilComponent
      },
      {
        path: 'my-company',
        component: MyCompanyComponent
      },
      {
        path: 'drivers',
        component: DriverComponent,
      },
      {
        path: 'planning',
        component: PlanningComponent,
      },
      {
        path :'users',
        component: UsersManagementComponent
      },
      {
        path:"roles",
        component: RoleComponent,
      },
      {
        path:"permissions",
        component:PermissionComponent
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
