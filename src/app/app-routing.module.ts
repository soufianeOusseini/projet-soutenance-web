import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangePasswordComponent } from "./auth/change-password/change-password.component";
import { RoleBasedRedirectGuard } from "./guards/role-based-redirect.guard";
import { AuthGuard } from "./guards/auth.guard";

const routes: Routes = [
  {
    path: '',
    canActivate: [RoleBasedRedirectGuard],
    children: []
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'admin-system',
    canActivate: [AuthGuard],
    loadChildren: () => import('./admin-system/admin-system.module').then(m => m.AdminSystemModule)
  },
  {
    path: 'change-password',
    canActivate: [AuthGuard],
    component: ChangePasswordComponent,
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
