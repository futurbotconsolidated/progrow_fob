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
  farmerData = {} as any;
  /* END: Variables */

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public commonService: CommonService,
    public oauthService: OAuthService,
    private spinner: NgxSpinnerService
  ) {
    this.userInfo = this.oauthService.getIdentityClaims();
  }

  ngOnInit(): void {
    this.loadData();
  }
  /* START: Non-API Function Calls */
  loadData() {
    const farmerId = this.activatedRoute.snapshot.params['farmerid'];
    this.getFarmerDetailsById(farmerId);
  }
  /* END: Non-API Function Calls */

  /* START: API Function Calls */
  getFarmerDetailsById(farmerId: any) {
    this.spinner.show();
    this.commonService.getFarmerDetailsById(farmerId).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.message != 'Success' || !res.status) {
          this.toastr.error(`${res.message}!`);
        } else {
          this.farmerData = res.data;
          localStorage.setItem(
            'farmer-details',
            JSON.stringify(this.farmerData)
          );
        }
      },
      (error: any) => {
        this.spinner.hide();
        this.toastr.error(
          `Failed to fetch farmer details, please try again...`
        );
      }
    );
  }
  /* END: API Function Calls */
}
