import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from "./admin.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { BusComponent } from "./bus/bus.component";
import { TrajetComponent } from "./trajet/trajet.component";
import { ColisComponent } from "./colis/colis.component";
import { TicketComponent } from "./ticket/ticket.component";
import { ReservationComponent } from "./reservation/reservation.component";
import { DetailComponent } from "./colis/detail/detail.component";
import { ProfilComponent } from "./profil/profil.component";
import { MyCompanyComponent } from "./my-company/my-company.component";
import { DriverComponent } from "./driver/driver.component";
import { PlanningComponent } from "./planning/planning.component";
import { UsersManagementComponent } from "./users-management/users-management.component";
import { RoleComponent } from "./account/role/role.component";
import { PermissionComponent } from "./account/permission/permission.component";
import { PermissionGuard } from "../guards/permission.guard";
import {AgenciesComponent} from "./agencies/agencies.component";

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'bus',
        component: BusComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'trips',
        component: TrajetComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'colis',
        component: ColisComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'colis/detail/:id',
        component: DetailComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'tickets',
        component: TicketComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'reservations',
        component: ReservationComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'profil',
        component: ProfilComponent
      },
      {
        path: 'my-company',
        component: MyCompanyComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'drivers',
        component: DriverComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'planning',
        component: PlanningComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'users',
        component: UsersManagementComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'roles',
        component: RoleComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'permissions',
        component: PermissionComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'] }
      },
      {
        path: 'agencies',
        component: AgenciesComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['ROLE_COMPANY_ADMIN'] }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
