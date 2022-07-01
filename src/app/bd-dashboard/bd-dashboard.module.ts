import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';

import { DashboardComponent } from './dashboard/dashboard.component';
import { BdRoutingModule } from './bd-routing.module';
import { BdHeaderComponent } from './bd-header/bd-header.component';
import { BdSidenavComponent } from './bd-sidenav/bd-sidenav.component';

@NgModule({
  declarations: [DashboardComponent, BdHeaderComponent, BdSidenavComponent],
  imports: [CommonModule, RouterModule, BdRoutingModule, DataTablesModule],
})
export class BdDashboardModule {}
