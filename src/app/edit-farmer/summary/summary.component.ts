import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { OAuthService } from 'angular-oauth2-oidc';
import { CommonService } from '../../shared/common.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements OnInit {
  /* START: Variables */
  userInfo: any;
  /* END: Variables */

  constructor(
    public commonService: CommonService,
    public oauthService: OAuthService
  ) {
    this.userInfo = this.oauthService.getIdentityClaims();
  }

  ngOnInit(): void {}
}
