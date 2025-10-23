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
import { InvoiceComponent } from './billings/invoice/invoice.component';
import { SubscriptionPlanComponent } from './billings/subscription-plan/subscription-plan.component';
import { SubscriptionComponent } from './billings/subscription/subscription.component';
import { SubscriptionFormComponent } from './billings/subscription/subscription-form/subscription-form.component';
import { SubscriptionPlanFormComponent } from './billings/subscription-plan/subscription-plan-form/subscription-plan-form.component';
import { InvoiceFormComponent } from './billings/invoice/invoice-form/invoice-form.component';
import { PayInvoiceModalComponent } from './billings/invoice/pay-invoice-modal/pay-invoice-modal.component';
import { InvoiceListComponent } from './billings/invoice/invoice-list/invoice-list.component';


@NgModule({
  declarations: [
    AdminSystemComponent,
    CompaniesComponent,
    AddFormComponent,
    StatistiqueComponent,
    InvoiceComponent,
    SubscriptionPlanComponent,
    SubscriptionComponent,
    SubscriptionFormComponent,
    SubscriptionPlanFormComponent,
    InvoiceFormComponent,
    PayInvoiceModalComponent,
    InvoiceListComponent,
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
    SharedModule,
  ]
})
export class AdminSystemModule { }
