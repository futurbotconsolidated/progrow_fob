import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import * as mapboxgl from 'mapbox-gl';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  /* START: Variables */
  userInfo: any;
  allExistingFarmers = [] as any;
  allPipelineFarmers = [] as any;
  overlayData = [] as any;

  selectedViewType = 'EXISTING_FARMS_LIST_VIEW';
  /* END: Variables */

  constructor(
    public oauthService: OAuthService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService
  ) {
    this.userInfo = this.oauthService.getIdentityClaims();
  }

  ngOnInit(): void {
    this.loadData();
  }

  /* START: Non-API Function Calls */
  loadData() {
    this.getExistingFarmers();
  }

  filterFarms(type: string) {
    this.selectedViewType = type;
    if (type == 'EXISTING_FARMS_LIST_VIEW') {
      if (!this.allExistingFarmers) this.getExistingFarmers();
    } else if (type == 'EXISTING_FARMS_MAP_VIEW') {
      this.overlayMap('EXISTING_FARMS_MAP_VIEW');
    } else if (type == 'FARMS_PIPELINE_LIST_VIEW') {
      if (!this.allPipelineFarmers) this.getFarmersPipeline();
    } else if (type == 'FARMS_PIPELINE_MAP_VIEW') {
      this.overlayMap('FARMS_PIPELINE_MAP_VIEW');
    }
  }

  overlayMap(type: string) {
    this.overlayData.length = 0;

    if (type == 'EXISTING_FARMS_MAP_VIEW') {
    }
  }
  /* END: Non-API Function Calls */

  /* START: API Function Calls */
  getExistingFarmers() {
    this.spinner.show();
    this.commonService.getExistingFarmers().subscribe(
      (res: any) => {
        this.spinner.hide();
        this.allExistingFarmers = res.data;
      },
      (error: any) => {
        this.spinner.hide();
        alert('Failed to fetch existing farmers data, please try again...');
      }
    );
  }

  getFarmersPipeline() {
    this.spinner.show();
    this.commonService.getFarmersPipeline().subscribe(
      (res: any) => {
        this.spinner.hide();
        this.allPipelineFarmers = res.data;
      },
      (error: any) => {
        this.spinner.hide();
        alert('Failed to fetch farmers pipeline data, please try again...');
      }
    );
  }
  /* END: API Functions Calls */
}
