import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminSystemRoutingModule } from './admin-system-routing.module';
import { AdminSystemComponent } from './admin-system.component';
import {CompaniesComponent} from "./companies/companies.component";
import {AddFormComponent} from "./companies/add-form/add-form.component";
import { StatistiqueComponent } from './statistique/statistique.component';
import {RouterModule, RouterOutlet} from "@angular/router";
import {AdminRoutingModule} from "../admin/admin-routing.module";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SecuredDirective} from "../utils/secured.directive";
import {SharedModule} from "../shared/shared.module";


@NgModule({
  declarations: [
    AdminSystemComponent,
    CompaniesComponent,
    AddFormComponent,
    StatistiqueComponent,
  ],
  imports: [
    CommonModule,
    AdminSystemRoutingModule,
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
export class AdminSystemModule { }
