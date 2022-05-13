import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements OnInit {
  /* START: Variables */
  userInfo: any;
  summary: any;
  /* END: Variables */

  constructor(
    public router: Router,
    public oauthService: OAuthService
    ) {
    this.userInfo = this.oauthService.getIdentityClaims();
    const farmer_details: any = localStorage.getItem('farmer-details');
    if (farmer_details) {
      this.summary = JSON.parse(farmer_details);
      console.log('summary : ', this.summary);
    }
  }

  ngOnInit(): void {
    // localStorage.setItem('router_url', this.router.url);
  }
}
