import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  /* START: Variables */
  userInfo: any;

  allFarmersData = [] as any;
  /* END: Variables */

  constructor(
    public oauthService: OAuthService,
    public commonService: CommonService
  ) {
    this.userInfo = this.oauthService.getIdentityClaims();
  }

  ngOnInit(): void {
    this.commonService.getAllFarmersData().subscribe((res: any) => {
      this.allFarmersData = res.data;
      console.log(res, 'log from dashboards');
    });
  }
}
