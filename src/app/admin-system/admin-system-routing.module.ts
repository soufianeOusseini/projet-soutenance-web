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
import {SubscriptionPlanComponent} from "./billings/subscription-plan/subscription-plan.component";
import {SubscriptionComponent} from "./billings/subscription/subscription.component";
import {InvoiceListComponent} from "./billings/invoice/invoice-list/invoice-list.component";
import {InvoiceComponent} from "./billings/invoice/invoice.component";
import {PermissionGuard} from "../guards/permission.guard";


const routes: Routes = [
  {
    path: '',
    component: AdminSystemComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: StatistiqueComponent,
      },
      {
        path: 'companies',
        component: CompaniesComponent,
      },
      {
        path: 'subscription-plan',
        component: SubscriptionPlanComponent,
      },
      {
        path: 'subscription',
        component: SubscriptionComponent,
      },
      {
        path: 'invoices',
        component: InvoiceComponent,
      }
    ]
  }

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminSystemRoutingModule { }
