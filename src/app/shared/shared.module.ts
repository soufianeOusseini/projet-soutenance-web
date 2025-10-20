import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import {SidebarComponent} from "./layout/sidebar/sidebar.component";
import {HeaderComponent} from "./layout/header/header.component";
import {SecuredDirective} from "../utils/secured.directive";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    SidebarComponent,
    HeaderComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    SecuredDirective,
    CommonModule,
    RouterModule,  // ← Nécessaire pour routerLink
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    SidebarComponent,
    HeaderComponent,
    SecuredDirective
  ]
})
export class SharedModule { }
