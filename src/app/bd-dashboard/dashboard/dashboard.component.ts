import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  userInfo: any;
  constructor(
    private appService: AppService,
    public oauthService: OAuthService
  ) {
    this.userInfo = this.oauthService.getIdentityClaims();

    console.log(this.userInfo);
  }

  ngOnInit(): void {
    this.appService.getAllFarmersData().subscribe((res: any) => {
      console.log(res, 'log from dashboards');
    });
  }
}
