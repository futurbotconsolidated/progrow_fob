import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor(private oauthService: OAuthService, public router: Router) {
    router.events.subscribe((url: any) => console.log(url));
  }

  ngOnInit(): void {}
  logOut() {
    this.oauthService.logOut();
    this.router.navigate(['/']);
  }
}
