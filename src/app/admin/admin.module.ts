import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import {RouterModule, RouterOutlet} from "@angular/router";
import {SidebarComponent} from "../layout/sidebar/sidebar.component";
import {HeaderComponent} from "../layout/header/header.component";
import {BrowserModule} from "@angular/platform-browser";
import { CompaniesComponent } from './companies/companies.component';
import {AdminRoutingModule} from "./admin-routing.module";
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddFormComponent } from './companies/add-form/add-form.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {ReactiveFormsModule} from "@angular/forms";
import { TrajetComponent } from './trajet/trajet.component';
import { ColisComponent } from './colis/colis.component';
import { TicketComponent } from './ticket/ticket.component';
import { ReservationComponent } from './reservation/reservation.component';
import { StaffsComponent } from './staffs/staffs.component';
import {AddBusFormComponent} from "./bus/add-form/add-bus-form.component";
import {AddColisFormComponent} from "./colis/add-form/add-colis-form.component";
import {AddTrajetFormComponent} from "./trajet/add-form/add-trajet-form.component";
import { AddTicketFormComponent } from './ticket/add-ticket-form/add-ticket-form.component';
import { AddStaffFormComponent } from './staffs/add-staff-form/add-staff-form.component';
import {BusComponent} from "./bus/bus.component";
import { DetailComponent } from './colis/detail/detail.component';
import {ProfilComponent} from "./profil/profil.component";

@NgModule({
  declarations: [
    AdminComponent,
    SidebarComponent,
    HeaderComponent,
    CompaniesComponent,
    DashboardComponent,
    AddFormComponent,
    BusComponent,
    TrajetComponent,
    ColisComponent,
    TicketComponent,
    ReservationComponent,
    StaffsComponent,
    AddBusFormComponent,
    AddColisFormComponent,
    AddTrajetFormComponent,
    AddTicketFormComponent,
    AddStaffFormComponent,
    DetailComponent,
    ProfilComponent
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
  ]
})
export class AdminModule { }
