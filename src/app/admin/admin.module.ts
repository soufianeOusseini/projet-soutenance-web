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



@NgModule({
  declarations: [
    AdminComponent,
    SidebarComponent,
    HeaderComponent,
    CompaniesComponent,
    DashboardComponent,
    AddFormComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    RouterOutlet,
    AdminRoutingModule,
    NgbModule,
    DialogModule,
    Button,
    ReactiveFormsModule
  ]
})
export class AdminModule { }
