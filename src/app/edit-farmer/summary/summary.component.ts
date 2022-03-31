import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements OnInit {
  /* START: Variables */
  userInfo: any;
  /* END: Variables */

  constructor(public oauthService: OAuthService) {
    this.userInfo = this.oauthService.getIdentityClaims();
  }

  ngOnInit(): void {}
}
