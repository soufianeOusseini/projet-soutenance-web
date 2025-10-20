import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdminComponent} from "../admin/admin.component";
import {DashboardComponent} from "../admin/dashboard/dashboard.component";
import {BusComponent} from "../admin/bus/bus.component";
import {TrajetComponent} from "../admin/trajet/trajet.component";
import {ColisComponent} from "../admin/colis/colis.component";
import {DetailComponent} from "../admin/colis/detail/detail.component";
import {TicketComponent} from "../admin/ticket/ticket.component";
import {ReservationComponent} from "../admin/reservation/reservation.component";
import {ProfilComponent} from "../admin/profil/profil.component";
import {MyCompanyComponent} from "../admin/my-company/my-company.component";
import {DriverComponent} from "../admin/driver/driver.component";
import {PlanningComponent} from "../admin/planning/planning.component";
import {UsersManagementComponent} from "../admin/users-management/users-management.component";
import {RoleComponent} from "../admin/account/role/role.component";
import {PermissionComponent} from "../admin/account/permission/permission.component";
import {AdminSystemComponent} from "./admin-system.component";
import {CompaniesComponent} from "./companies/companies.component";
import {StatistiqueComponent} from "./statistique/statistique.component";


const routes: Routes = [
  {
    path: '',
    component: AdminSystemComponent,
    children: [
      {
        path: '',
        component: StatistiqueComponent,
      },
      {
        path: 'companies',
        component: CompaniesComponent,
      },
    ]
  }

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSystemRoutingModule { }
