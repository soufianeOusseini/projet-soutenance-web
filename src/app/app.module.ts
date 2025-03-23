import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {AuthModule} from "./auth/auth.module";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {AdminModule} from "./admin/admin.module";
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";

@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [RouterModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        AppRoutingModule,
        AuthModule,
        AdminModule,
        NgbModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
