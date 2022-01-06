import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OAuthModule, OAuthModuleConfig } from 'angular-oauth2-oidc';
import { HomeComponent } from './home/home.component';
import { OAuthService } from 'angular-oauth2-oidc';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [AppComponent, LoginComponent, HomeComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CoreModule.forRoot(),
    OAuthModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
