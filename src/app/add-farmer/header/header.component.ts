import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { authConfig } from 'src/app/sso.config';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor(private oauthService: OAuthService, public router: Router) {}

  ngOnInit(): void {}

  logout() {
    this.oauthService.logOut();
    this.oauthService.events.subscribe((e) => {
      console.log(e);
      console.debug('Your session has been terminated!');
    });
  }
}
