import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import {RouterModule, RouterOutlet} from "@angular/router";
import {AdminRoutingModule} from "./admin-routing.module";
import { DashboardComponent } from './dashboard/dashboard.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { TrajetComponent } from './trajet/trajet.component';
import { ColisComponent } from './colis/colis.component';
import { TicketComponent } from './ticket/ticket.component';
import { ReservationComponent } from './reservation/reservation.component';
import {AddBusFormComponent} from "./bus/add-form/add-bus-form.component";
import {AddColisFormComponent} from "./colis/add-form/add-colis-form.component";
import {AddTrajetFormComponent} from "./trajet/add-form/add-trajet-form.component";
import { AddTicketFormComponent } from './ticket/add-ticket-form/add-ticket-form.component';
import {BusComponent} from "./bus/bus.component";
import { DetailComponent } from './colis/detail/detail.component';
import {ProfilComponent} from "./profil/profil.component";
import { MyCompanyComponent } from './my-company/my-company.component';
import { GeneralComponent } from './my-company/tabs/general/general.component';
import { AccountsComponent } from './my-company/tabs/accounts/accounts.component';
import { DriverComponent } from './driver/driver.component';
import { FormDriverComponent } from './driver/form-driver/form-driver.component';
import { PlanningComponent } from './planning/planning.component';
import { AgencyComponent } from './my-company/tabs/agency/agency.component';
import { UsersManagementComponent } from './users-management/users-management.component';
import { AddUsersComponent } from './users-management/add-users/add-users.component';
import { RoleComponent } from './account/role/role.component';
import {SecuredDirective} from "../utils/secured.directive";
import { AddRoleFormComponent } from './account/role/add-form/add-role-form.component';
import { PermissionComponent } from './account/permission/permission.component';
import { AddPermissionToAccessComponent } from './account/permission/add-permission-role/add-permission-to-access.component';
import {SharedModule} from "../shared/shared.module";
import { AgenciesComponent } from './agencies/agencies.component';
import { AddAgencyFormComponent } from './agencies/add-agency-form/add-agency-form.component';

@NgModule({
  declarations: [
    AdminComponent,
    DashboardComponent,
    BusComponent,
    TrajetComponent,
    ColisComponent,
    TicketComponent,
    ReservationComponent,
    AddBusFormComponent,
    AddColisFormComponent,
    AddTrajetFormComponent,
    AddTicketFormComponent,
    DetailComponent,
    ProfilComponent,
    MyCompanyComponent,
    GeneralComponent,
    AccountsComponent,
    DriverComponent,
    FormDriverComponent,
    PlanningComponent,
    AgencyComponent,
    UsersManagementComponent,
    AddUsersComponent,
    RoleComponent,
    AddRoleFormComponent,
    PermissionComponent,
    AddPermissionToAccessComponent,
    AgenciesComponent,
    AddAgencyFormComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    RouterOutlet,
    AdminRoutingModule,
    NgbModule,
    DialogModule,
    Button,
    ReactiveFormsModule,
    FormsModule,
    SecuredDirective,
    SharedModule
  ]
})
export class AdminModule { }
