import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { OAuthService } from 'angular-oauth2-oidc';
import { CommonService } from '../../shared/common.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-edit-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.css'],
})
export class EditHeaderComponent implements OnInit {
  /* START: Variables */
  farmerId = '';
  farmerData = {} as any;
  demographicDisp = {} as any;
  currentRoute = '';
  /* END: Variables */

  constructor(
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public commonService: CommonService,
    public oauthService: OAuthService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
    console.log(router.url);
    this.farmerId = this.activatedRoute.snapshot.params['farmerid'];
    this.router.events.subscribe((event) => {
      if (
        event.constructor.name === 'NavigationEnd' ||
        event instanceof NavigationEnd
      ) {
        const A = this.router.url.replace('/', '').split('/');
        console.log(A);

        if (A[0] === 'edit' && A[1] === 'demographic-info') {
          this.loadData();
        } else {
          const B = localStorage.getItem('farmer-details');
          if (B) {
            this.demographicDisp = JSON.parse(B).demographic_info;
          }
        }
      }
    });
  }
  ngOnInit(): void {}
  /* START: Non-API Function Calls */
  loadData() {
    localStorage.removeItem('farmer-details');

    this.getFarmerDetailsById(this.farmerId);
  }
  // get Name from Master Json
  getDisplayName(dataProperty: string, id: any) {
    return this.commonService.getDisplayName('demoGraphic', dataProperty, id);
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
          this.demographicDisp = this.farmerData?.demographic_info;
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
