import {Injector, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {AuthModule} from "./auth/auth.module";
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from "@angular/common/http";
import {AdminModule} from "./admin/admin.module";
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {AuthInterceptor} from "./utils/auth.interceptor";
import {MessageService} from "primeng/api";
import {Toast, ToastModule} from "primeng/toast";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
export let StaticInjector: Injector
@NgModule({
  declarations: [
    AppComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    AdminModule,
    NgbModule,
    Toast,
    BrowserAnimationsModule, // IMPORTANT pour les animations PrimeNG
    ToastModule,
  ],
  providers: [
    MessageService,
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class AppModule {}
