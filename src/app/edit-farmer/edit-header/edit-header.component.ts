import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CommonService } from '../../shared/common.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-edit-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.css'],
})
export class EditHeaderComponent implements OnInit {
  /* START: Variables */
  farmerId = '';
  demographicDisp = {} as any;
  userInfo: any;
  // indexed db variables
  displayFarmerProfileImage = '' as any;
  concatePage = 'demographic';
  indexedDBFileNameManage = {
    farmerProfile: { front: `${this.concatePage}_farmerProfileImage` },
  };
  dob = 'NA';
  /* END: Variables */

  constructor(
    public oauthService: OAuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private dbService: NgxIndexedDBService,
    public commonService: CommonService
  ) {
    this.userInfo = this.oauthService.getIdentityClaims();
    this.farmerId = this.activatedRoute.snapshot.params['farmerId'];
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.demographicDisp = JSON.parse(A).demographic_info;
      if(this.demographicDisp?.farmerDetails?.dob){
        this.dob = formatDate(this.demographicDisp?.farmerDetails?.dob, 'dd-MM-yyyy', 'en_IN');
      }
    }

    // patch farmer Profile image
    this.displayFarmerProfileImage = this.commonService.fetchFarmerDocument(
      this.indexedDBFileNameManage.farmerProfile.front
    );
  }

  ngOnInit(): void {}

  logOut() {
    this.oauthService.logOut();
    this.router.navigate(['/']);
  }

}
