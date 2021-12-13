import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { BdRoutingModule } from './bd-dashboard/bd-routing.module';
import { AddFarmerModule } from './add-farmer/add-farmer.module';
import { AddFarmerRoutingModule } from './add-farmer/add-farmer-routing.module';

@NgModule({
  declarations: [AppComponent, LoginComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
