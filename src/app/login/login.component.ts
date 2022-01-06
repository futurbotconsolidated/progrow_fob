import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginInterface } from '../shared/modal/login-interface';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm = new FormGroup({
    userId: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  item: LoginInterface = {
    userId: '',
    password: '',
    newPassword: '',
  };
  constructor(private authService: OAuthService) {}
  public login($event: any) {
    $event.preventDefault();
    this.authService.initLoginFlow();
  }
}
